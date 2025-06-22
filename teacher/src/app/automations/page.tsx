'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AutomationRule, TriggeredAutomationEvent } from '@/app/types';
import AutomationCard from '@/app/components/AutomationCard';
import AddAutomationModal from '@/app/components/AddAutomationModal';
import TriggeredAutomationLog from '@/app/components/TriggeredAutomationLog';
import { FiPlus, FiSearch } from 'react-icons/fi';

const mockAutomations: AutomationRule[] = [
  {
    id: '1',
    trigger: 'STATUS_CHANGE_ON_TO_OFF',
    action: { message: 'Looks like you might be stuck. Do you need help?' },
    scope: 'SINGLE_STUDENT',
    enabled: true,
  },
  {
    id: '2',
    trigger: 'ON_TASK_FOR_MINUTES',
    condition: { minutes: 15 },
    action: { message: 'Great job staying focused for 15 minutes! Keep it up.' },
    scope: 'SINGLE_STUDENT',
    enabled: true,
  },
  {
    id: '3',
    trigger: 'STATUS_CHANGE_OFF_TO_ON',
    action: { message: 'Welcome back! Glad to see you on task.' },
    scope: 'SINGLE_STUDENT',
    enabled: false,
  },
];

const mockTriggeredEvents: TriggeredAutomationEvent[] = [
  {
    id: 'evt1',
    ruleId: '1',
    ruleMessage: 'Looks like you might be stuck. Do you need help?',
    studentName: 'Sarah Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: 'evt2',
    ruleId: '2',
    ruleMessage: 'Great job staying focused for 15 minutes! Keep it up.',
    studentName: 'Alex Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
  },
  {
    id: 'evt3',
    ruleId: '1',
    ruleMessage: 'Looks like you might be stuck. Do you need help?',
    studentName: 'Emily Davis',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
];

export default function AutomationsHubPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockAutomations);
  const [triggeredEvents] = useState<TriggeredAutomationEvent[]>(mockTriggeredEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddRule = (newRule: Omit<AutomationRule, 'id'>) => {
    const ruleWithId = { ...newRule, id: Date.now().toString() };
    setRules(prev => [ruleWithId, ...prev]);
  };

  const handleUpdateRule = (updatedRule: AutomationRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const filteredRules = rules.filter(rule =>
    rule.action.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/sussi_icon.PNG" alt="Sussi Logo" className="w-13 h-13" />
              <div>
                <h1 className="text-4xl font-formal font-bold text-text-primary leading-none">Sussi</h1>
                <p className="text-sm text-text-muted">Student Use & Screen Status Interface</p>
              </div>
            </div>
            <Link href="/" className="text-text-secondary hover:text-text-primary font-semibold">
                Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Your Automations */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-formal font-bold text-text-primary">Your Automation Rules</h2>
                <p className="text-text-secondary mt-1">
                  Manage your custom rules. They will run automatically based on student activity.
                </p>
              </div>
              <div className="relative">
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredRules.length > 0 ? (
                filteredRules.map(rule => (
                  <AutomationCard 
                    key={rule.id}
                    rule={rule} 
                    onUpdate={handleUpdateRule}
                    onDelete={handleDeleteRule}
                  />
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                  <h3 className="text-xl font-formal font-bold text-text-primary">No Matching Automations</h3>
                  <p className="text-text-secondary mt-2">
                    {searchQuery ? 'Try a different search term.' : 'Click "Add Automation" to get started.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Trigger History */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28">
              <h3 className="text-2xl font-formal font-bold text-text-primary mb-4">Trigger History</h3>
              <p className="text-text-secondary mb-6">
                A log of all the automations that have recently run.
              </p>
              <div className="space-y-3">
                {triggeredEvents.map((event) => (
                  <TriggeredAutomationLog key={event.id} event={event} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AddAutomationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRule={handleAddRule}
      />
    </div>
  );
} 