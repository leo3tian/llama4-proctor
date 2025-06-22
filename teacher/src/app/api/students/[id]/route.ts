import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { Student, StudentStatus } from '../../../../app/types';

function mapFocusScoreToStatus(score: number): StudentStatus {
  if (score > 3) return 'ON_TASK';
  if (score > 1) return 'MAYBE_OFF_TASK';
  return 'NEEDS_HELP';
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const studentId = params.id;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('LlamaProctorDB');
    
    const dbStudent = await db.collection('students').findOne({ id: studentId });

    if (!dbStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student: Student = {
      id: dbStudent.id,
      name: dbStudent.name || `Student ${dbStudent.id}`,
      screenshot: dbStudent.screenshot || `/screenshots/placeholder.png`,
      status: mapFocusScoreToStatus(dbStudent.focusScore),
      currentActivity: dbStudent.shortDescription || 'No task information',
      lastUpdated: dbStudent.lastUpdated ? new Date(dbStudent.lastUpdated) : new Date(),
      focusScore: dbStudent.focusScore,
      description: dbStudent.description,
      history: dbStudent.history,
      active: dbStudent.active,
    };

    return NextResponse.json(student);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to fetch student' }, { status: 500 });
  }
}