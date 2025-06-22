'use client';

import React, { useState } from 'react';
import { AutomationRule, AutomationTrigger, AutomationScope } from '../types';

interface AddAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (newRule: Omit<AutomationRule, 'id'>) => void;
}

const triggerOptions: { value: AutomationTrigger; label: string; needsCondition: boolean }[] = [
    { value: 'STATUS_CHANGE_ON_TO_OFF', label: 'On-task → Off-task', needsCondition: false },
    { value: 'STATUS_CHANGE_OFF_TO_ON', label: 'Off-task → On-task', needsCondition: false },
    { value: 'ON_TASK_FOR_MINUTES', label: 'On-task for X mins', needsCondition: true },
    { value: 'OFF_TASK_FOR_MINUTES', label: 'Off-task for X mins', needsCondition: true },
];

const scopeOptions: { value: AutomationScope; label: string }[] = [
  { value: 'SINGLE_STUDENT', label: 'Single Student' },
  { value: 'ALL_STUDENTS', label: 'All Students' },
];

const initialRuleState = {
    trigger: 'STATUS_CHANGE_ON_TO_OFF' as AutomationTrigger,
    condition: { minutes: 10 },
    action: { message: '' },
    scope: 'SINGLE_STUDENT' as AutomationScope,
    enabled: true,
};

export default function AddAutomationModal({ isOpen, onClose, onAddRule }: AddAutomationModalProps) {
  const [newRule, setNewRule] = useState(initialRuleState);
  const currentTrigger = triggerOptions.find(t => t.value === newRule.trigger);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRule(newRule);
    setNewRule(initialRuleState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-formal font-bold text-text-primary">Add New Automation</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Trigger</label>
              <select
                value={newRule.trigger}
                onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value as AutomationTrigger })}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                {triggerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {currentTrigger?.needsCondition && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Condition (Minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={newRule.condition?.minutes || ''}
                  onChange={(e) => setNewRule({ ...newRule, condition: { minutes: parseInt(e.target.value) } })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
              <textarea
                placeholder="e.g., Great job staying focused!"
                value={newRule.action.message}
                onChange={(e) => setNewRule({ ...newRule, action: { message: e.target.value } })}
                className="w-full p-2 border border-border rounded-md bg-background"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Scope</label>
              <select
                value={newRule.scope}
                onChange={(e) => setNewRule({ ...newRule, scope: e.target.value as AutomationScope })}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                {scopeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="p-6 flex justify-end gap-4 bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Automation</button>
          </div>
        </form>
      </div>
    </div>
  );
} 