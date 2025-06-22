'use client';

import React from 'react';
import { Student, StudentStatus } from '../types';
import { FiUserX, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { getScreenshotSrc } from '../utils/image';
import { sendMessage as sendMessageApi } from '../services/api';
import Toast from './Toast';

interface StudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (studentId: string, message: string) => void;
  onFlagStudent?: (studentId: string, reason: string) => void;
  onRemoveStudent?: (studentId: string) => void;
}

const statusStyles: Record<StudentStatus, { bg: string; text: string; label: string }> = {
  ON_TASK: { bg: 'bg-accent-green', text: 'text-white', label: 'On Task' },
  MAYBE_OFF_TASK: { bg: 'bg-accent-orange', text: 'text-white', label: 'Maybe Off-Task' },
  NEEDS_HELP: { bg: 'bg-accent-red', text: 'text-white', label: 'Needs Help' },
};

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

export default function StudentModal({ 
  student, 
  isOpen, 
  onClose, 
  onSendMessage, 
  onFlagStudent, 
  onRemoveStudent 
}: StudentModalProps) {
  const [message, setMessage] = React.useState('');
  const [flagReason, setFlagReason] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setFlagReason('');
      setIsSending(false);
      setToast(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const styles = statusStyles[student.status];

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessageApi({
        studentId: student.id,
        classroomId: '1', // Assuming a single classroom for now
        text: message.trim(),
        sender: 'TEACHER',
      });
      setToast({ message: 'Message sent successfully!', type: 'success' });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setToast({ message: 'Failed to send message.', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleFlagStudent = () => {
    if (flagReason.trim() && onFlagStudent) {
      onFlagStudent(student.id, flagReason.trim());
      setFlagReason('');
    }
  };

  const handleRemoveStudent = () => {
    if (onRemoveStudent) {
      onRemoveStudent(student.id);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-surface rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-formal font-bold text-text-primary">{student.name}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl">&times;</button>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow overflow-y-auto">
            {/* Image Container */}
            <div className="bg-background relative">
              <img
                src={getScreenshotSrc(student.screenshot)}
                alt={`${student.name}'s screen`}
                className="w-full h-auto max-h-96 object-contain"
              />
              <div className={`absolute bottom-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${styles.bg} ${styles.text} shadow-lg`}>
                {styles.label}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-text-secondary text-sm">Current Activity</h4>
                  <p className="text-text-primary">{student.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-secondary text-sm">Last Updated</h4>
                  <p className="text-text-primary">{student.lastUpdated.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Send Message</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg"
                      disabled={isSending}
                    />
                    <button onClick={handleSendMessage} className="btn-primary" disabled={isSending}>
                      {isSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Add Note</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg"
                    />
                    <button onClick={handleFlagStudent} className="btn-secondary">Add Note</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
               <div className="flex space-x-2">
                  {!student.isMock && (
                    <Link href={`/students/${student.id}`} passHref>
                      <button className="btn-secondary flex items-center gap-2">
                        <FiExternalLink />
                        <span>See Detailed View</span>
                      </button>
                    </Link>
                  )}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={handleRemoveStudent}
                >
                  <FiUserX />
                  <span>Remove from Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}