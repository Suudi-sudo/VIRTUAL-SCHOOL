// Example auth service using fetch (replace URLs with your API endpoints)
export const login = async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if(!res.ok) throw new Error('Login failed');
    return await res.json();
  };
  
  export const signup = async (data) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if(!res.ok) throw new Error('Signup failed');
    return await res.json();
  };
  
  export const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  };
  