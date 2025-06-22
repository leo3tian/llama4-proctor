'use client';

import React from 'react';
import { Student } from '../types';

interface StudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (studentId: string, message: string) => void;
  onFlagStudent?: (studentId: string, reason: string) => void;
  onRemoveStudent?: (studentId: string) => void;
}

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

  React.useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setFlagReason('');
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

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(student.id, message.trim());
      setMessage('');
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">{student.name}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">&times;</button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <img
              src={student.screenshot}
              alt={`${student.name}'s screen`}
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-secondary">Status</h4>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-bold text-white ${
                  student.isMatching ? 'bg-accent-green' : 'bg-accent-red'
                }`}>
                  {student.isMatching ? 'On Task' : 'Needs Help'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text-secondary">Current Activity</h4>
                <p className="text-text-primary">{student.currentActivity}</p>
              </div>
              <div>
                <h4 className="font-semibold text-text-secondary">Last Updated</h4>
                <p className="text-text-primary">{student.lastUpdated.toLocaleString()}</p>
              </div>
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
                />
                <button onClick={handleSendMessage} className="btn-primary">Send</button>
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

            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold text-text-primary mb-2">Danger Zone</h3>
              <button onClick={handleRemoveStudent} className="btn-danger">
                Remove from Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 