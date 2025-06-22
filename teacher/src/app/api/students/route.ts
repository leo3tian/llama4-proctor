import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { Student, StudentStatus } from '../../../app/types';

function mapFocusScoreToStatus(score: number): StudentStatus {
  if (score > 7) return 'ON_TASK';
  if (score > 4) return 'MAYBE_OFF_TASK';
  return 'NEEDS_HELP';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('LlamaProctorDB');
    
    const studentsFromDb = await db.collection('students').find({ classroom: classroomId, active: true }).toArray();
    console.log(studentsFromDb);
    const students: Student[] = studentsFromDb.map((dbStudent: any) => ({
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
      isMock: false,
    }));

    return NextResponse.json(students);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to fetch students' }, { status: 500 });
  }
} 