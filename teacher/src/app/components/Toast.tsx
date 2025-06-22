'use client';

import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-accent-green' : 'bg-accent-red';

  return (
    <div className={`fixed bottom-5 right-5 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 ${bgColor}`}>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
} 