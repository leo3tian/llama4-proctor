'use client';

import React from 'react';
import { TriggeredAutomationEvent } from '../types';
import { FiMessageSquare } from 'react-icons/fi';

interface TriggeredAutomationLogProps {
  event: TriggeredAutomationEvent;
}

export default function TriggeredAutomationLog({ event }: TriggeredAutomationLogProps) {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-lg border border-border">
      <div className="mt-1 text-text-muted">
          <FiMessageSquare size={18} />
      </div>
      <div>
        <p className="text-sm text-text-primary">
          Sent <span className="font-semibold italic">"{event.ruleMessage}"</span> to <span className="font-semibold">{event.studentName}</span>.
        </p>
        <p className="text-xs text-text-muted mt-1" title={event.timestamp.toLocaleString()}>
          {timeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  );
} 