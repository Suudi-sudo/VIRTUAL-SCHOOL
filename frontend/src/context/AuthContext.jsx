import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Ensure you have this installed
import "react-toastify/dist/ReactToastify.css"; // Toast styles

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
        const res = await fetch("https://virtual-school-2.onrender.com/current-user");
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

  
  // Google login
  const googleLogin = async (email) => {
    toast.loading("Logging you in...");
    try {
      const response = await fetch("https://virtual-school-2.onrender.com/google_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.access_token) {
        toast.dismiss();
        sessionStorage.setItem("token", data.access_token);

        const userResponse = await fetch("https://virtual-school-2.onrender.com/current_user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        const user = await userResponse.json();
        if (user.email) {
          setUser(user); // Update user state
          localStorage.setItem("user", JSON.stringify(user));
          toast.success("Successfully logged in!");

          // Role-based navigation
          if (user.role === "Educator" || user.role === "Student") {
            navigate("/admin");
          } else if (user.role === "Owner") {
            navigate("/admin");
          }
        }
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to login");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
      console.error("Google login error:", error);
    }
  };

 // Login function
 const login = async (email, password) => {
  const res = await fetch("https://virtual-school-2.onrender.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    
    // Role-based redirection
    if (data.role === "Educator") {
      navigate("/educator/dashboard");
    } else if (data.role === "Student") {
      navigate("/student/dashboard");
    } else if (data.role === "Owner") {
      navigate("/admin");
    }
  } else {
    throw new Error(data.error);
  }
};
  // Logout function
  const logout = async () => {
    await fetch("https://virtual-school-2.onrender.com/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("token"); // Clear session token
  };

  // Update profile
  const updateProfile = async (updates) => {
    const res = await fetch("https://virtual-school-2.onrender.com/update-profile", {
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
    <AuthContext.Provider
      value={{ user, login, logout, updateProfile, getCurrentUser, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Auth
export const useAuth = () => useContext(AuthContext);