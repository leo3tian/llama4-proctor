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
    <div className="simple-card p-6 w-full mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm text-text-secondary uppercase tracking-wider">Class</h2>
          <p className="text-3xl font-formal font-bold text-text-primary">AP US History</p>
        </div>
        <div className="text-right">
          <h2 className="text-sm text-text-secondary uppercase tracking-wider">Current Activity</h2>
          <p className="text-3xl font-formal font-bold text-accent-blue">{currentInstruction}</p>
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <label htmlFor="instruction-input" className="text-text-secondary font-medium whitespace-nowrap">
            Update Activity:
          </label>
          <input
            id="instruction-input"
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="What are we working on now?"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all"
            disabled={isLoading}
          />
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
        {error && <p className="text-sm text-accent-red mt-2 pl-36">{error}</p>}
      </div>
    </div>
  );
} 