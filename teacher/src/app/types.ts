export type StudentStatus = 'ON_TASK' | 'MAYBE_OFF_TASK' | 'NEEDS_HELP';

export interface Student {
  id: string;
  name: string;
  screenshot: string;
  status: StudentStatus;
  currentActivity: string;
  lastUpdated: Date;
  isMock?: boolean;
  focusScore?: number;
  description?: string;
  history?: string[];
  active?: boolean;
}

export interface FlaggedStudent {
  id: string;
  name: string;
  timestamp: Date;
  mismatchSummary: string;
}

export type ViewMode = 'grid' | 'heatmap';

export type AutomationTrigger = 
  | 'STATUS_CHANGE_ON_TO_OFF'
  | 'STATUS_CHANGE_OFF_TO_ON'
  | 'ON_TASK_FOR_MINUTES'
  | 'OFF_TASK_FOR_MINUTES';

export type AutomationScope = 'SINGLE_STUDENT' | 'ALL_STUDENTS';

export interface AutomationRule {
  id: string;
  trigger: AutomationTrigger;
  condition?: {
    minutes?: number;
  };
  action: {
    message: string;
  };
  scope: AutomationScope;
  enabled: boolean;
}

export interface TriggeredAutomationEvent {
  id: string;
  ruleId: string;
  ruleMessage: string;
  studentName: string;
  timestamp: Date;
} 