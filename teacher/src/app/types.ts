export interface Student {
  id: string;
  name: string;
  screenshot: string;
  isMatching: boolean;
  currentActivity: string;
  lastUpdated: Date;
}

export interface FlaggedStudent {
  id: string;
  name: string;
  timestamp: Date;
  mismatchSummary: string;
}

export type ViewMode = 'grid' | 'heatmap'; 