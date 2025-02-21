import React, { createContext, useState, useEffect } from 'react';
import { fetchSchools } from '../services/schoolService';

export const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    fetchSchools().then(setSchools).catch(console.error);
  }, []);

  return (
    <SchoolContext.Provider value={{ schools }}>
      {children}
    </SchoolContext.Provider>
  );
};
