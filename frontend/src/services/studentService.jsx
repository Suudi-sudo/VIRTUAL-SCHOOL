export const fetchStudents = async () => {
    const res = await fetch('/api/students');
    if(!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  };
  