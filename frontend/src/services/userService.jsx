export const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if(!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  };
  