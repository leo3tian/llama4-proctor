// llama4-tools/readHistory.ts
// Tool definition for Llama 4 tool calling: readHistory

/**
 * Tool: readHistory
 * Description: Provides the entire array of a student's history to the LLM.
 * Parameters:
 *   - studentId: string (the unique ID of the student)
 * Returns:
 *   - history: string[] (the full history array for the student)
 */

import { Student } from '../src/app/types';
import db from '../src/lib/mongodb';

export async function readHistory({ studentId }: { studentId: string }) {
  // Connect to the database and fetch the student by ID
  const student: Student | null = await db.collection('students').findOne({ id: studentId });
  if (!student) {
    throw new Error('Student not found');
  }
  // Return the full history array
  return { history: student.history || [] };
}

// Tool definition for Llama 4 API
export const readHistoryTool = {
  name: 'readHistory',
  description: 'Provides the entire array of a student\'s history to the LLM.',
  parameters: {
    type: 'object',
    properties: {
      studentId: {
        type: 'string',
        description: 'The unique ID of the student whose history you want to retrieve.'
      }
    },
    required: ['studentId']
  }
};
