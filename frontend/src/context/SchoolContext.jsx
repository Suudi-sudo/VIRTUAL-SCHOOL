import React, { createContext, useState, useEffect } from "react";
import { fetchSchools } from "../services/schoolService";

export const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schools from backend
  const loadSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchools();
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setError("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  return (
    <SchoolContext.Provider value={{ schools, loading, error, refreshSchools: loadSchools }}>
      {children}
    </SchoolContext.Provider>
  );
};
