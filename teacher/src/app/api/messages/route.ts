import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { Message } from '../../../app/types';

export async function POST(request: Request) {
  try {
    const messageData: Partial<Message> = await request.json();

    if (!messageData.studentId || !messageData.text || !messageData.sender || !messageData.classroomId) {
      return NextResponse.json({ error: 'Missing required message fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('LlamaProctorDB');
    
    const newMessage: Omit<Message, 'id'> = {
      studentId: messageData.studentId,
      classroomId: messageData.classroomId,
      text: messageData.text,
      sender: messageData.sender,
      timestamp: new Date(),
    };

    const result = await db.collection('messages').insertOne(newMessage);

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to send message' }, { status: 500 });
  }
} 