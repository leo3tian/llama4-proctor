import { NextResponse } from 'next/server';
import { Student, MessageSender } from '@/app/types';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { messages, student } = (await request.json()) as { messages: any[], student: Student };

    if (!messages || !student) {
      return NextResponse.json({ error: 'Messages and student data are required' }, { status: 400 });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "sendMessage",
          description: "Sends a helpful message to the student. This message will be recorded in the system.",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The content of the message to send to the student.",
              },
            },
            required: ["text"],
          },
        },
      },
    ];

    const systemContent = `You are a helpful assistant for a teacher. You are discussing a student named ${student.name}.
Here is the student's current data:
- Status: ${student.status}
- Focus Score: ${student.focusScore}
- Current Activity: ${student.currentActivity}
- Detailed Description: ${student.description}
- Active: ${student.active}

Keep your responses concise and helpful for a teacher monitoring their classroom. You have the ability to send messages to the student.`;

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

      if (functionName === 'sendMessage') {
        try {
          const client = await clientPromise;
          const db = client.db('LlamaProctorDB');
          await db.collection('messages').insertOne({
            studentId: student.id,
            classroomId: "1",
            text: functionArgs.text,
            sender: 'SUSSI_AI' as MessageSender,
            timestamp: new Date(),
          });
          toolResultContent = `Successfully sent message: "${functionArgs.text}"`;
        } catch (e) {
          console.error('Failed to execute sendMessage tool:', e);
          toolResultContent = "Failed to send the message due to an internal error.";
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
    return NextResponse.json({ error: 'Unable to process chat' }, { status: 500 });
  }
} 