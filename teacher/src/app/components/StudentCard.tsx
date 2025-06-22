'use client';

import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <div 
      className="simple-card cursor-pointer group overflow-hidden"
      onClick={() => onClick(student)}
    >
      <div className="relative">
        <img
          src={student.screenshot}
          alt={`${student.name}'s screen`}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white ${
          student.isMatching ? 'bg-accent-green' : 'bg-accent-red'
        }`}>
          {student.isMatching ? 'ON TASK' : 'NEEDS HELP'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-text-primary truncate">{student.name}</h3>
        <p className="text-sm text-text-secondary truncate">{student.currentActivity}</p>
        {/* <p className="text-xs text-text-muted mt-2">
          Last updated: {student.lastUpdated.toLocaleTimeString()}
        </p> */}
      </div>

      {/* Status Border Bottom */}
      <div className={`h-1 w-full ${student.isMatching ? 'bg-accent-green' : 'bg-accent-red'}`}></div>
    </div>
  );
} 