'use client';

import React, { useState } from 'react';
import { AutomationRule, AutomationTrigger, AutomationScope } from '../types';
import { FiEdit, FiTrash2, FiSave } from 'react-icons/fi';

interface AutomationCardProps {
  rule: AutomationRule;
  onUpdate: (updatedRule: AutomationRule) => void;
  onDelete: (id: string) => void;
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

export default function AutomationCard({ rule, onUpdate, onDelete }: AutomationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState(rule);

  const handleToggle = () => {
    onUpdate({ ...editedRule, enabled: !editedRule.enabled });
  };

  const handleSave = () => {
    onUpdate(editedRule);
    setIsEditing(false);
  };
  
  const currentTrigger = triggerOptions.find(t => t.value === editedRule.trigger);

  return (
    <div className={`simple-card p-6 transition-all duration-300 ${editedRule.enabled ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* Trigger */}
        <div className="md:col-span-2">
          <label className="block text-xs text-text-muted mb-1">Trigger</label>
          {isEditing ? (
            <select
              value={editedRule.trigger}
              onChange={(e) => setEditedRule({ ...editedRule, trigger: e.target.value as AutomationTrigger })}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              {triggerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <p className="font-semibold">{currentTrigger?.label}</p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label className="block text-xs text-text-muted mb-1">Condition</label>
          {currentTrigger?.needsCondition ? (
            isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editedRule.condition?.minutes || ''}
                  onChange={(e) => setEditedRule({ ...editedRule, condition: { minutes: parseInt(e.target.value) } })}
                  className="w-20 p-2 border border-border rounded-md bg-background"
                />
                <span>mins</span>
              </div>
            ) : (
              <p>{editedRule.condition?.minutes} mins</p>
            )
          ) : (
            <p className="text-text-muted">—</p>
          )}
        </div>

        {/* Message */}
        <div className="md:col-span-2">
          <label className="block text-xs text-text-muted mb-1">Message</label>
          {isEditing ? (
            <textarea
              value={editedRule.action.message}
              onChange={(e) => setEditedRule({ ...editedRule, action: { message: e.target.value } })}
              className="w-full p-2 border border-border rounded-md bg-background"
              rows={2}
            />
          ) : (
            <p className="italic">"{editedRule.action.message}"</p>
          )}
        </div>

        {/* Scope */}
        <div>
          <label className="block text-xs text-text-muted mb-1">Scope</label>
          {isEditing ? (
            <select
              value={editedRule.scope}
              onChange={(e) => setEditedRule({ ...editedRule, scope: e.target.value as AutomationScope })}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              {scopeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <p>{scopeOptions.find(s => s.value === editedRule.scope)?.label}</p>
          )}
        </div>

        {/* Actions & Toggle */}
        <div className="flex items-center justify-end gap-4 md:col-span-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${editedRule.enabled ? 'text-text-primary' : 'text-text-muted'}`}>
              {editedRule.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editedRule.enabled ? 'bg-accent-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editedRule.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="h-6 w-px bg-border"></div>
          {isEditing ? (
            <button onClick={handleSave} className="btn-primary p-2">
              <FiSave size={18} />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary p-2">
              <FiEdit size={18} />
            </button>
          )}
          <button onClick={() => onDelete(rule.id)} className="btn-danger p-2">
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
} 