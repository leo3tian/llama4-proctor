'use client';

import React from 'react';
import { TbReload } from "react-icons/tb";
import InstructionPanel from './components/InstructionPanel';
import AddStudentPanel from './components/AddStudentPanel';
import StudentGrid from './components/StudentGrid';
import HeatmapView from './components/HeatmapView';
import FlagSummaryPanel from './components/FlagSummaryPanel';
import ViewToggle from './components/ViewToggle';
import Toast from './components/Toast';
import StudentModal from './components/StudentModal';
import { Student, ViewMode } from './types';
import { updateStudentActivity } from './mockData';

export default function Dashboard() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [currentInstruction, setCurrentInstruction] = React.useState('Watch YouTube video about Greek history');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [toast, setToast] = React.useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const refreshData = React.useCallback(() => {
    setStudents(prevStudents => 
      prevStudents.map(student => updateStudentActivity(student))
    );
    setLastUpdated(new Date());
  }, []);

  // Simulate real-time updates every 10 seconds
  React.useEffect(() => {
    if (students.length === 0) {
      if (lastUpdated) setLastUpdated(null);
      return;
    }

    if (!lastUpdated) {
      setLastUpdated(new Date());
    }
    const interval = setInterval(refreshData, 10000);

    return () => clearInterval(interval);
  }, [students.length, lastUpdated, refreshData]);

  const handleAddStudent = (student: Student) => {
    if (students.find(s => s.id === student.id)) {
      setToast({ message: 'Student already added to the dashboard', type: 'error' });
      return;
    }
    setStudents(prev => [...prev, student]);
    setToast({ message: `Added ${student.name} to the dashboard`, type: 'success' });
    setLastUpdated(new Date());
  };

  const handleError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const handleSetInstruction = (instruction: string) => {
    setCurrentInstruction(instruction);
    setToast({ message: 'Activity updated successfully', type: 'success' });
  };

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSendMessage = (studentId: string, message: string) => {
    setToast({ 
      message: `Message sent to ${selectedStudent?.name}: "${message}"`, 
      type: 'success' 
    });
  };

  const handleFlagStudent = (studentId: string, reason: string) => {
    setToast({ 
      message: `Note added for ${selectedStudent?.name}: "${reason}"`, 
      type: 'success' 
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    const studentName = students.find(s => s.id === studentId)?.name;
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setToast({ 
      message: `${studentName} removed from dashboard`, 
      type: 'success' 
    });
    setLastUpdated(new Date());
  };

  const handleReload = () => {
    refreshData();
    setToast({ message: 'Data refreshed', type: 'success' });
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary">Classroom Monitor</h1>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-text-secondary">Students</div>
                <div className="font-bold text-lg text-accent-blue">{students.length}</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary">On Task</div>
                <div className="font-bold text-lg text-accent-green">{students.filter(s => s.isMatching).length}</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary">Needs Help</div>
                <div className="font-bold text-lg text-accent-red">{students.filter(s => !s.isMatching).length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <InstructionPanel 
              currentInstruction={currentInstruction}
              onSetInstruction={handleSetInstruction}
            />
            <AddStudentPanel 
              onAddStudent={handleAddStudent}
              onError={handleError}
            />
            <ViewToggle 
              currentView={viewMode}
              onViewChange={handleViewChange}
            />
            <FlagSummaryPanel 
              students={students}
              currentInstruction={currentInstruction}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="simple-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    {viewMode === 'grid' ? 'Student Activity View' : 'Classroom Layout'}
                  </h2>
                  <span className="text-sm text-text-secondary">
                    {students.length} students connected
                  </span>
                </div>
                {students.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-text-secondary text-right">
                      Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                    </div>
                    <button
                      onClick={handleReload}
                      className="btn-secondary p-2 text-lg"
                    >
                      <TbReload size={20} />
                    </button>
                  </div>
                )}
              </div>

              {viewMode === 'grid' ? (
                <StudentGrid 
                  students={students} 
                  onStudentClick={handleStudentClick}
                />
              ) : (
                <HeatmapView 
                  students={students} 
                  onStudentClick={handleStudentClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSendMessage={handleSendMessage}
        onFlagStudent={handleFlagStudent}
        onRemoveStudent={handleRemoveStudent}
      />

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
