'use client';

import React from 'react';
import { Student } from '../types';

interface FlagSummaryPanelProps {
  students: Student[];
  currentInstruction: string;
}

export default function FlagSummaryPanel({ students, currentInstruction }: FlagSummaryPanelProps) {
  const studentsNeedingAttention = students
    .filter(student => student.status !== 'ON_TASK')
    .sort((a, b) => {
      // Prioritize NEEDS_HELP over MAYBE_OFF_TASK
      if (a.status === 'NEEDS_HELP' && b.status !== 'NEEDS_HELP') return -1;
      if (a.status !== 'NEEDS_HELP' && b.status === 'NEEDS_HELP') return 1;
      return 0;
    });

  if (studentsNeedingAttention.length === 0) {
    return (
      <div className="simple-card p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-formal font-bold text-text-primary mb-1">Great Job!</h3>
        <p className="text-text-secondary text-sm">All students are on task.</p>
      </div>
    );
  }

  const getStatusStyles = (status: 'MAYBE_OFF_TASK' | 'NEEDS_HELP') => {
    if (status === 'NEEDS_HELP') {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-accent-red',
        label: 'Needs Help'
      };
    }
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-accent-orange',
      label: 'Maybe Off-Task'
    };
  };

  return (
    <div className="simple-card p-6">
      <h2 className="text-xl font-formal font-bold text-text-primary mb-4">
        Review ({studentsNeedingAttention.length})
      </h2>
      
      <div className="max-h-80 overflow-y-auto space-y-3">
        {studentsNeedingAttention.map((student) => {
          if (student.status === 'ON_TASK') return null;
          const styles = getStatusStyles(student.status);
          return (
            <div key={student.id} className={`p-3 ${styles.bg} border ${styles.border} rounded-lg`}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-text-primary">{student.name}</h3>
                <span className={`text-xs font-bold ${styles.text}`}>{styles.label}</span>
              </div>
              <p className="text-sm text-text-secondary truncate">{student.currentActivity}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
} 