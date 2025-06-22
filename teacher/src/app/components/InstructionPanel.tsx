'use client';

import React from 'react';

interface InstructionPanelProps {
  currentInstruction: string;
  onSetInstruction: (instruction: string) => void;
}

export default function InstructionPanel({ currentInstruction, onSetInstruction }: InstructionPanelProps) {
  const [instruction, setInstruction] = React.useState(currentInstruction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onSetInstruction(instruction.trim());
    }
  };

  return (
    <div className="simple-card p-6">
      <h2 className="text-lg font-bold text-text-primary mb-4">Current Activity</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">
            What should students be working on?
          </label>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Reading chapter 3"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Update Activity
        </button>
      </form>
      
      {currentInstruction && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Current Task:</span> {currentInstruction}
          </p>
        </div>
      )}
    </div>
  );
} 