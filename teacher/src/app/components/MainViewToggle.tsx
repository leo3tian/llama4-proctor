'use client';

import React from 'react';
import { FiGrid, FiMessageSquare, FiMap } from 'react-icons/fi';

export type MainView = 'activity' | 'layout' | 'chat';

interface MainViewToggleProps {
  currentView: MainView;
  onViewChange: (view: MainView) => void;
}

export default function MainViewToggle({ currentView, onViewChange }: MainViewToggleProps) {
  const options: { value: MainView; label: string; icon: React.ElementType }[] = [
    { value: 'activity', label: 'Student Grid', icon: FiGrid },
    { value: 'layout', label: 'Classroom Layout', icon: FiMap },
    { value: 'chat', label: 'Classroom Chat', icon: FiMessageSquare },
  ];

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors
            ${currentView === option.value
              ? 'bg-white text-accent-blue shadow-sm'
              : 'text-text-secondary hover:bg-gray-200'
            }`}
        >
          <option.icon className="h-5 w-5" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
} 