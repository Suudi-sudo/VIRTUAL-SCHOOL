export const fetchSchools = async () => {
    const res = await fetch('/api/schools');
    if(!res.ok) throw new Error('Failed to fetch schools');
    return await res.json();
  };
  
  export const createSchool = async (data) => {
    const res = await fetch('/api/schools/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if(!res.ok) throw new Error('Failed to create school');
    return await res.json();
  };
  