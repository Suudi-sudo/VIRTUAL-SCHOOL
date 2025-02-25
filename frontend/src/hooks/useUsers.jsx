// A custom hook to fetch or manage user data; stub example:
import { useState, useEffect } from 'react';
import { fetchUsers } from '../services/userService';

const useUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  return users;
};

export default useUsers;
