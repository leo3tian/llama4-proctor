'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StudentStatus } from '../types';
import { FiChevronDown } from 'react-icons/fi';

type FilterOption = StudentStatus | 'ALL';

interface StudentFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts: {
    ALL: number;
    ON_TASK: number;
    MAYBE_OFF_TASK: number;
    NEEDS_HELP: number;
  };
}

const filterOptions: { key: FilterOption, label: string }[] = [
  { key: 'ALL', label: 'All Students' },
  { key: 'ON_TASK', label: 'On Task' },
  { key: 'MAYBE_OFF_TASK', label: 'Maybe Off-Task' },
  { key: 'NEEDS_HELP', label: 'Needs Help' },
];

const statusStyles: Record<FilterOption, { dot: string; text: string; bg: string }> = {
  ALL: { dot: 'bg-gray-400', text: 'text-text-secondary', bg: 'bg-gray-100' },
  ON_TASK: { dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-green-50' },
  MAYBE_OFF_TASK: { dot: 'bg-accent-orange', text: 'text-accent-orange', bg: 'bg-orange-50' },
  NEEDS_HELP: { dot: 'bg-accent-red', text: 'text-accent-red', bg: 'bg-red-50' },
};

const useClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default function StudentFilter({ currentFilter, onFilterChange, counts }: StudentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef as React.RefObject<HTMLDivElement>, () => setIsOpen(false));

  const selectedOption = filterOptions.find(opt => opt.key === currentFilter);
  const selectedStyles = statusStyles[currentFilter];

  return (
    <div className="relative inline-block text-left mb-6" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-between items-center w-64 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full mr-3 ${selectedStyles.dot}`}></span>
            {selectedOption?.label}
          </span>
          <FiChevronDown className="-mr-1 ml-2 h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {filterOptions.map(({ key, label }) => (
              <a
                key={key}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onFilterChange(key);
                  setIsOpen(false);
                }}
                className={`flex justify-between items-center px-4 py-2 text-sm ${
                  currentFilter === key ? `font-bold ${statusStyles[key].text}` : 'text-text-secondary'
                } hover:${statusStyles[key].bg}`}
                role="menuitem"
              >
                <span className="flex items-center">
                  <span className={`h-2.5 w-2.5 rounded-full mr-3 ${statusStyles[key].dot}`}></span>
                  {label}
                </span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">{counts[key]}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}