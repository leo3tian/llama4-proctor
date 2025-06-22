import { NextResponse } from 'next/server';
import { Student } from '@/app/types';
import { sendMessage } from '../../../lib/messageHelper';

export async function POST(request: Request) {
  try {
    const { messages, students, currentInstruction } = (await request.json()) as { messages: any[], students: Student[], currentInstruction: string };

    if (!messages || !students) {
      return NextResponse.json({ error: 'Messages and students data are required' }, { status: 400 });
    }
    
    const studentNameIdMap = students.reduce((acc, s) => {
      acc[s.name] = s.id;
      return acc;
    }, {} as Record<string, string>);

    const tools = [
      {
        type: "function",
        function: {
          name: "sendMessageToStudent",
          description: "Sends a helpful message to a specific student. This message will be recorded in the system.",
          parameters: {
            type: "object",
            properties: {
              studentName: {
                type: "string",
                description: "The full name of the student to send the message to.",
                enum: Object.keys(studentNameIdMap),
              },
              text: {
                type: "string",
                description: "The content of the message to send to the student.",
              },
            },
            required: ["studentName", "text"],
          },
        },
      },
    ];
    
    // Sanitize and format student data for the context
    const studentContext = students.map(s => {
      const historySummary = s.history && s.history.length > 0
        ? `\\n    Activity History: [${s.history.slice(0, 5).map(h => `"${h}"`).join(', ')}${s.history.length > 5 ? ', ...' : ''}]`
        : '';
      return `- ${s.name}: Status is ${s.status}, Focus Score is ${s.focusScore || 'N/A'}. Current activity: ${s.currentActivity}${historySummary}`;
    }).join('\\n');

    const systemContent = `You are a helpful assistant for a teacher monitoring their classroom. Speak in natural languages and only call tools if specifically asked to.
The current assignment for the class is: "${currentInstruction}".
Here is a summary of all the students in the class:
${studentContext}

Answer the teacher's questions based on this data. You can send messages to students if needed.`;

    const llamaMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
    ];

    const response = await fetch('https://api.llama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        messages: llamaMessages,
        tools: tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLaMA API Error:', errorText);
      return NextResponse.json({ error: `LLaMA API error: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const responseData = await response.json();
    const responseMessage = responseData.completion_message;

    if (responseMessage.stop_reason === 'tool_calls' && responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let toolResultContent = "";

      if (functionName === 'sendMessageToStudent') {
        const studentId = studentNameIdMap[functionArgs.studentName];
        if (studentId) {
          try {
            await sendMessage(studentId, "1", functionArgs.text, 'SUSSI_AI');
            toolResultContent = `Successfully sent message to ${functionArgs.studentName}.`;
          } catch (e) {
            console.error('Failed to execute sendMessage tool:', e);
            toolResultContent = `Failed to send message to ${functionArgs.studentName} due to an internal error.`;
          }
        } else {
          toolResultContent = `Could not send message: Student "${functionArgs.studentName}" not found.`;
        }
      }

      const secondWaveMessages = [
        ...llamaMessages,
        responseMessage,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResultContent,
        },
      ];
      
      const secondResponse = await fetch('https://api.llama.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
            messages: secondWaveMessages,
          }),
      });

      if (!secondResponse.ok) {
         const errorText = await secondResponse.text();
         console.error('LLaMA API Error (second call):', errorText);
         return NextResponse.json({ error: `LLaMA API error on second call: ${secondResponse.statusText}`, details: errorText }, { status: secondResponse.status });
      }

      const secondData = await secondResponse.json();
      return NextResponse.json({
        role: secondData.completion_message.role,
        content: secondData.completion_message.content.text,
        toolCall: {
          name: functionName,
          arguments: functionArgs,
        }
      });
    }

    return NextResponse.json({
        role: responseMessage.role,
        content: responseMessage.content.text,
        toolCall: null,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to process classroom chat' }, { status: 500 });
  }
} 