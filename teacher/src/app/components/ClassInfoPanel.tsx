'use client';

import React from 'react';
import { updateActivity } from '../services/api';

interface ClassInfoPanelProps {
  currentInstruction: string;
  onSetInstruction: (instruction: string) => void;
}

export default function ClassInfoPanel({ currentInstruction, onSetInstruction }: ClassInfoPanelProps) {
  const [instruction, setInstruction] = React.useState(currentInstruction);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateActivity(instruction.trim());
      onSetInstruction(instruction.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-accent-blue rounded-lg shadow-md p-6 w-full mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm text-white/70 uppercase tracking-wider">Class</h2>
          <p className="text-3xl font-formal font-bold text-white">AP US History</p>
        </div>
        <div className="text-right">
          <h2 className="text-sm text-white/70 uppercase tracking-wider">Current Activity</h2>
          <p className="text-3xl font-formal font-bold text-white">{currentInstruction}</p>
        </div>
      </div>
      <div className="mt-6 border-t border-white/20 pt-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <label htmlFor="instruction-input" className="text-white/90 font-medium whitespace-nowrap">
            Update Activity:
          </label>
          <input
            id="instruction-input"
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="What are we working on now?"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg placeholder-white/50 focus:ring-2 focus:ring-white focus:border-white transition-all"
            disabled={isLoading}
          />
          <button type="submit" className="bg-white text-accent-blue font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
        {error && <p className="text-sm text-white bg-red-500/50 rounded-md px-2 py-1 mt-2 ml-36">{error}</p>}
      </div>
    </div>
  );
} 