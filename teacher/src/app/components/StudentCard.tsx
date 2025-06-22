'use client';

import React from 'react';
import { Student, StudentStatus } from '../types';
import { getScreenshotSrc } from '../utils/image';

interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
}

const statusStyles: Record<StudentStatus, { bg: string; text: string; label: string }> = {
  ON_TASK: { bg: 'bg-accent-green', text: 'text-white', label: 'On Task' },
  MAYBE_OFF_TASK: { bg: 'bg-accent-orange', text: 'text-white', label: 'Sussi' },
  NEEDS_HELP: { bg: 'bg-accent-red', text: 'text-white', label: 'Needs Help' },
};

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const styles = statusStyles[student.status];

  return (
    <div 
      className="simple-card cursor-pointer group overflow-hidden"
      onClick={() => onClick(student)}
    >
      <div className="relative">
        <img
          src={getScreenshotSrc(student.screenshot)}
          alt={`${student.name}'s screen`}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${styles.bg} ${styles.text}`}>
          {styles.label}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-formal font-bold text-lg text-text-primary truncate">{student.name}</h3>
        <p className="text-sm text-text-secondary truncate">{student.currentActivity}</p>
        {/* <p className="text-xs text-text-muted mt-2">
          Last updated: {student.lastUpdated.toLocaleTimeString()}
        </p> */}
      </div>

      {/* Status Border Bottom */}
      <div className={`h-1 w-full ${styles.bg}`}></div>
    </div>
  );
}