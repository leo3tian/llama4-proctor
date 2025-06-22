'use client';

import React from 'react';
import { TbReload } from "react-icons/tb";
import Link from 'next/link';
import ClassInfoPanel from './components/ClassInfoPanel';
import AddStudentPanel from './components/AddStudentPanel';
import StudentGrid from './components/StudentGrid';
import HeatmapView from './components/HeatmapView';
import FlagSummaryPanel from './components/FlagSummaryPanel';
import Toast from './components/Toast';
import StudentModal from './components/StudentModal';
import StudentFilter from './components/StudentFilter';
import { Student, StudentStatus } from './types';
import { updateStudentActivity } from './mockData';
import { getStudents } from './services/api';
import ClassroomChat from './components/ClassroomChat';
import MainViewToggle, { MainView } from './components/MainViewToggle';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-blue"></div>
  </div>
);

export default function Dashboard() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [currentInstruction, setCurrentInstruction] = React.useState('Watch YouTube video about Greek history');
  const [toast, setToast] = React.useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<StudentStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = React.useState(true);
  const [mainView, setMainView] = React.useState<MainView>('activity');

  const refreshData = React.useCallback(async () => {
    try {
      const dbStudents = await getStudents('1');
      
      setStudents(prevStudents => {
        const mockStudents = prevStudents.filter(s => s.isMock);
        const updatedMockStudents = mockStudents.map(updateStudentActivity);
        return [...dbStudents, ...updatedMockStudents];
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh student data:', error);
      setToast({ message: 'Failed to refresh student data from the database.', type: 'error' });
    }
  }, []);

  React.useEffect(() => {
    const initialLoad = async () => {
      await refreshData();
      setIsLoading(false);
    };

    initialLoad();

    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleAddStudent = (student: Student) => {
    if (students.find(s => s.id === student.id)) {
      setToast({ message: 'Student already added to the dashboard', type: 'error' });
      return;
    }
    setStudents(prev => [...prev, { ...student, isMock: true }]);
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

  const filteredStudents = students.filter(student => {
    if (filterStatus === 'ALL') return true;
    return student.status === filterStatus;
  });

  const statusCounts = {
    ALL: students.length,
    ON_TASK: students.filter(s => s.status === 'ON_TASK').length,
    MAYBE_OFF_TASK: students.filter(s => s.status === 'MAYBE_OFF_TASK').length,
    NEEDS_HELP: students.filter(s => s.status === 'NEEDS_HELP').length,
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/sussi_icon.PNG" alt="Sussi Logo" className="w-13 h-13" />
              <div>
                <h1 className="text-4xl font-formal font-bold text-text-primary leading-none">Sussi</h1>
                <p className="text-sm text-text-muted">Student Use & Screen Status Interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/automations" className="text-text-secondary hover:text-text-primary font-semibold">
                Automations Hub
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <ClassInfoPanel 
          currentInstruction={currentInstruction}
          onSetInstruction={handleSetInstruction}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <AddStudentPanel 
              onAddStudent={handleAddStudent}
              onError={handleError}
            />
            <FlagSummaryPanel 
              students={students}
              currentInstruction={currentInstruction}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <MainViewToggle currentView={mainView} onViewChange={setMainView} />
            </div>

            {mainView === 'chat' ? (
              <ClassroomChat currentInstruction={currentInstruction} />
            ) : (
              <div className="simple-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-formal font-bold text-text-primary">
                      {mainView === 'activity' ? 'Student Grid' : 'Classroom Layout'}
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
                
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {mainView === 'activity' && (
                      <StudentFilter 
                        currentFilter={filterStatus}
                        onFilterChange={setFilterStatus}
                        counts={statusCounts}
                      />
                    )}
                    {mainView === 'activity' ? (
                      <StudentGrid 
                        students={filteredStudents} 
                        onStudentClick={handleStudentClick}
                      />
                    ) : (
                      <HeatmapView 
                        students={students} 
                        onStudentClick={handleStudentClick}
                      />
                    )}
                  </>
                )}
              </div>
            )}
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
