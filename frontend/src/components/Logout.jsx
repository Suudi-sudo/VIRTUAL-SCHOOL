import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import { toast } from "react-toastify";

const LogoutButton = () => {
//   const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // await logout(); // Call the logout function from context
    toast.success("Logged out successfully!");
    navigate("/"); // Redirect to homepage
  };

  return (
    <button
      onClick={handleLogout}
      className="nav-link text-white d-flex align-items-center px-2 py-2 border-0 bg-transparent"
    >
      <FaSignOutAlt className="me-2" /> Logout
    </button>
  );
};

export default LogoutButton;
