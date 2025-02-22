export const fetchTeachers = async () => {
    const res = await fetch('/api/teachers');
    if(!res.ok) throw new Error('Failed to fetch teachers');
    return await res.json();
  };
  