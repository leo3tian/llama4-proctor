'use client';

import React from 'react';
import { Student, StudentStatus } from '../types';

interface HeatmapViewProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
}

const statusStyles: Record<StudentStatus, string> = {
  ON_TASK: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer',
  MAYBE_OFF_TASK: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 cursor-pointer',
  NEEDS_HELP: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200 cursor-pointer',
};

export default function HeatmapView({ students, onStudentClick }: HeatmapViewProps) {
  if (students.length === 0) {
    return (
      <div className="simple-card p-8 text-center">
        <p className="text-text-secondary">No students match the current filter.</p>
        <p className="text-text-muted text-sm mt-1">Try selecting "All Students" to see everyone.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {Array.from({ length: 30 }, (_, i) => {
          const student = students.find(s => s.id === `stu${String(i + 1).padStart(3, '0')}`);
          const isActive = !!student;
          
          return (
            <div
              key={i}
              onClick={() => student && onStudentClick?.(student)}
              className={`aspect-square rounded-lg border flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                isActive ? statusStyles[student.status] : 'bg-gray-100 border-gray-200 text-text-muted'
              }`}
            >
              {isActive ? student?.name.split(' ')[0] : 'Empty'}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 text-sm mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>On Task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
          <span>Maybe Off-Task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span>Needs Help</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
          <span>Empty Seat</span>
        </div>
      </div>
    </div>
  );
} 