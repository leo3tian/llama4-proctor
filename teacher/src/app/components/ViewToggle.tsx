'use client';

import React from 'react';
import { ViewMode } from '../types';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="simple-card p-6">
      <h2 className="text-xl font-formal font-bold text-text-primary mb-4">View Options</h2>
      
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewChange('grid')}
          className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            currentView === 'grid'
              ? 'bg-white text-accent-blue shadow'
              : 'bg-transparent text-text-secondary'
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => onViewChange('heatmap')}
          className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            currentView === 'heatmap'
              ? 'bg-white text-accent-blue shadow'
              : 'bg-transparent text-text-secondary'
          }`}
        >
          Classroom Layout
        </button>
      </div>
    </div>
  );
} 