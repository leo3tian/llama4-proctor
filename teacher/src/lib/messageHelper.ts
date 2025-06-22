import clientPromise from './mongodb';
import { MessageSender } from '../app/types';

/**
 * Sends a message to a student, replacing any previous message for that student in the same classroom.
 * The database schema uses 'id' for the student's ID and 'classroom' for the classroom's ID.
 * @param studentId The ID of the student.
 * @param classroomId The ID of the classroom.
 * @param text The content of the message.
 * @param sender The sender of the message ('TEACHER', 'SUSSI_AI', or 'AUTOMATION').
 */
export async function sendMessage(
  studentId: string,
  classroomId: string,
  text: string,
  sender: MessageSender
) {
  try {
    const client = await clientPromise;
    const db = client.db('LlamaProctorDB');
    const messagesCollection = db.collection('messages');

    const filter = { id: studentId, classroom: classroomId };

    const newMessage = {
      id: studentId,
      classroom: classroomId,
      text,
      sender,
      timestamp: new Date(),
    };

    // Replace previous message for this student in this classroom, or insert if it doesn't exist.
    const result = await messagesCollection.updateOne(
      filter,
      { $set: newMessage },
      { upsert: true }
    );
    
    return { success: true, result };

  } catch (error) {
    console.error('Failed to execute sendMessage helper:', error);
    throw new Error('Failed to send message.');
  }
} 