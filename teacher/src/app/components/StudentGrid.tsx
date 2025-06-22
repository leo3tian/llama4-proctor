'use client';

import React from 'react';
import { Student } from '../types';
import StudentCard from './StudentCard';

interface StudentGridProps {
  students: Student[];
  onStudentClick: (student: Student) => void;
}

export default function StudentGrid({ students, onStudentClick }: StudentGridProps) {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No students added yet. Add a student to start monitoring.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student) => (
        <StudentCard 
          key={student.id} 
          student={student} 
          onClick={onStudentClick}
        />
      ))}
    </div>
  );
} 