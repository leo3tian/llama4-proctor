'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Student } from '../../types';
import Link from 'next/link';
import StudentChat from '../../components/StudentChat';

const StudentDetailSkeleton = () => (
  <div className="container mx-auto px-6 py-8 animate-pulse">
    <div className="w-48 h-8 bg-gray-300 rounded mb-4"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-gray-200 rounded-lg w-full h-96 mb-8"></div>
        <div className="space-y-6">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="h-8 w-1/2 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);


export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      const fetchStudent = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/students/${studentId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch student data');
          }
          const data = await response.json();
          setStudent({
            ...data,
            lastUpdated: new Date(data.lastUpdated),
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [studentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TASK': return 'text-accent-green';
      case 'MAYBE_OFF_TASK': return 'text-accent-orange';
      case 'NEEDS_HELP': return 'text-accent-red';
      default: return 'text-text-secondary';
    }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-background text-text-primary font-sans">
        <header className="border-b border-border bg-surface sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-text-secondary hover:text-text-primary font-semibold">
              &larr; Back to Dashboard
            </Link>
             <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </header>
        <StudentDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10">Error: {error}</div>;
  }

  if (!student) {
    return <div className="text-center py-10">Student not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-text-secondary hover:text-text-primary font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold font-formal text-text-primary hidden md:block">
                    {student.name}
                </h1>
                <img src="/sussi_icon.PNG" alt="Sussi Logo" className="w-10 h-10" />
            </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="simple-card overflow-hidden">
              <img src={student.screenshot} alt={`Screenshot of ${student.name}'s screen`} className="w-full object-cover" />
              <div className="p-6">
                <h2 className="text-3xl font-bold font-formal mb-1">{student.name}</h2>
                <p className={`font-semibold mb-4 ${getStatusColor(student.status)}`}>
                  Status: {student.status.replace('_', ' ')}
                </p>
                <div className="border-t border-border pt-4">
                  <h3 className="text-xl font-bold font-formal mb-4">Current Activity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="font-semibold text-text-secondary block mb-1">Focus Score</label>
                      <p className="text-lg">{student.focusScore ?? 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-text-secondary block mb-1">Last Updated</label>
                      <p className="text-lg">{student.lastUpdated.toLocaleString()}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="font-semibold text-text-secondary block mb-1">Summary</label>
                      <p>{student.currentActivity}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="font-semibold text-text-secondary block mb-1">Detailed Description</label>
                      <p className="text-text-muted">{student.description ?? 'No description available.'}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-text-secondary block mb-1">Device Status</label>
                      <p className={`font-semibold ${student.active ? 'text-accent-green' : 'text-accent-red'}`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <StudentChat student={student} />
          </div>
          
          <div className="lg:col-span-1 space-y-8">
            <div className="simple-card p-6 flex flex-col max-h-screen">
              <h3 className="text-xl font-bold font-formal mb-4 flex-shrink-0">Activity History</h3>
              <div className="overflow-y-auto flex-grow">
                {student.history && student.history.length > 0 ? (
                  <ul className="space-y-3">
                    {student.history.map((item, index) => (
                      <li key={index} className="text-sm text-text-muted border-l-2 pl-3 border-border">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No activity history available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 