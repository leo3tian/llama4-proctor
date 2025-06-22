export const updateActivity = async (description: string) => {
  const response = await fetch('/api/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update activity');
  }

  return response.json();
};

export const getStudents = async (classroomId: string) => {
  const response = await fetch(`/api/students?classroomId=${classroomId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  const data = await response.json();
  // We need to convert the lastUpdated string back to a Date object
  return data.map((student: any) => ({
    ...student,
    lastUpdated: new Date(student.lastUpdated),
  }));
}; 