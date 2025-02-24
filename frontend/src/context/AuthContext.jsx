import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if user is logged in when app loads
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Get current user
  const getCurrentUser = async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      try {
        const res = await fetch("http://127.0.0.1:5000/current-user");
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    }
  };

  // Login function
  const login = async (email, password) => {
    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      throw new Error(data.error);
    }
  };

  // Logout function
  const logout = async () => {
    await fetch("http://127.0.0.1:5000/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("user");
  };

  // Update profile
  const updateProfile = async (updates) => {
    const res = await fetch("http://127.0.0.1:5000/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      throw new Error(data.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Auth
export const useAuth = () => useContext(AuthContext);
