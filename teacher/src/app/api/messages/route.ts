import { NextResponse } from 'next/server';
import { Message } from '../../../app/types';
import { sendMessage } from '../../../lib/messageHelper';

export async function POST(request: Request) {
  try {
    const body: Partial<Omit<Message, 'id' | 'timestamp'>> = await request.json();
    const { studentId, classroomId, text, sender } = body;

    if (!studentId || !classroomId || !text || !sender) {
      return NextResponse.json({ error: 'Missing required fields: studentId, classroomId, text, sender' }, { status: 400 });
    }

    const { result } = await sendMessage(studentId, classroomId, text, sender);

    return NextResponse.json({ success: true, result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to send message' }, { status: 500 });
  }
} 