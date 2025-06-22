import { Student, StudentStatus } from './types';

// Mock student database
export const mockStudentDb: Record<string, Student> = {
  "stu001": {
    id: "stu001",
    name: "Alex Johnson",
    screenshot: "https://picsum.photos/300/200?random=1",
    status: 'ON_TASK',
    currentActivity: "Watching YouTube video about Greek history",
    lastUpdated: new Date()
  },
  "stu002": {
    id: "stu002",
    name: "Sarah Chen",
    screenshot: "https://picsum.photos/300/200?random=2",
    status: 'NEEDS_HELP',
    currentActivity: "Scrolling through TikTok",
    lastUpdated: new Date()
  },
  "stu003": {
    id: "stu003",
    name: "Michael Rodriguez",
    screenshot: "https://picsum.photos/300/200?random=3",
    status: 'ON_TASK',
    currentActivity: "Reading Greek history article",
    lastUpdated: new Date()
  },
  "stu004": {
    id: "stu004",
    name: "Emily Davis",
    screenshot: "https://picsum.photos/300/200?random=4",
    status: 'NEEDS_HELP',
    currentActivity: "Playing online games",
    lastUpdated: new Date()
  },
  "stu005": {
    id: "stu005",
    name: "David Kim",
    screenshot: "https://picsum.photos/300/200?random=5",
    status: 'MAYBE_OFF_TASK',
    currentActivity: "Browsing Wikipedia",
    lastUpdated: new Date()
  },
  "stu006": {
    id: "stu006",
    name: "Lisa Wang",
    screenshot: "https://picsum.photos/300/200?random=6",
    status: 'MAYBE_OFF_TASK',
    currentActivity: "Searching Google",
    lastUpdated: new Date()
  }
};

// Mock fetch function to simulate API call
export const fetchStudent = async (studentId: string): Promise<Student | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const student = mockStudentDb[studentId];
      if (student) {
        // Return a fresh copy to avoid mutation issues
        resolve({ ...student, lastUpdated: new Date() });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// Generate random activity for simulation
export const generateRandomActivity = (): string => {
  const activities = [
    "Watching YouTube video about Greek history",
    "Reading Greek history article",
    "Taking notes on Greek history",
    "Scrolling through TikTok",
    "Playing online games",
    "Checking social media",
    "Browsing shopping websites",
    "Watching Netflix",
    "Browsing Wikipedia",
    "Searching on Google",
    "Watching a YouTube video",
  ];
  return activities[Math.floor(Math.random() * activities.length)];
};

// Update student activity randomly for simulation
export const updateStudentActivity = (student: Student): Student => {
  const newActivity = generateRandomActivity();
  let status: StudentStatus;

  if (newActivity.toLowerCase().includes("greek history")) {
    status = 'ON_TASK';
  } else if (newActivity.toLowerCase().includes("wikipedia") || newActivity.toLowerCase().includes("google") || newActivity === "Watching a YouTube video") {
    status = 'MAYBE_OFF_TASK';
  } else {
    status = 'NEEDS_HELP';
  }
  
  return {
    ...student,
    screenshot: `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
    status,
    currentActivity: newActivity,
    lastUpdated: new Date()
  };
}; 