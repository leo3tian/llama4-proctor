'use client';

import React from 'react';
import { fetchStudent } from '../mockData';
import { Student } from '../types';

interface AddStudentPanelProps {
  onAddStudent: (student: Student) => void;
  onError: (message: string) => void;
}

export default function AddStudentPanel({ onAddStudent, onError }: AddStudentPanelProps) {
  const [studentId, setStudentId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsLoading(true);
    try {
      const student = await fetchStudent(studentId.trim());
      if (student) {
        onAddStudent(student);
        setStudentId('');
      } else {
        onError(`Student with ID "${studentId}" not found.`);
      }
    } catch (error) {
      onError('Failed to find student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-card p-6">
      <h2 className="text-lg font-bold text-text-primary mb-4">Add Student</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g., stu001"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Adding...' : 'Add Student'}
        </button>
      </form>
      
      <div className="mt-4">
        <p className="text-text-secondary text-xs">Available IDs: stu001, stu002, stu003, stu004, stu005, stu006</p>
      </div>
    </div>
  );
} 