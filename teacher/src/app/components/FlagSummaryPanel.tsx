'use client';

import React from 'react';
import { Student, FlaggedStudent } from '../types';

interface FlagSummaryPanelProps {
  students: Student[];
  currentInstruction: string;
}

export default function FlagSummaryPanel({ students, currentInstruction }: FlagSummaryPanelProps) {
  const flaggedStudents: FlaggedStudent[] = students
    .filter(student => !student.isMatching)
    .map(student => ({
      id: student.id,
      name: student.name,
      timestamp: student.lastUpdated,
      mismatchSummary: student.currentActivity
    }));

  if (flaggedStudents.length === 0) {
    return (
      <div className="simple-card p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Great Job!</h3>
        <p className="text-text-secondary text-sm">All students are on task.</p>
      </div>
    );
  }

  return (
    <div className="simple-card p-6">
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Students Needing Help ({flaggedStudents.length})
      </h2>
      
      <div className="max-h-80 overflow-y-auto space-y-3">
        {flaggedStudents.map((student) => (
          <div key={student.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-text-primary">{student.name}</h3>
              <span className="text-xs text-text-secondary">
                {student.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-accent-red truncate">{student.mismatchSummary}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 