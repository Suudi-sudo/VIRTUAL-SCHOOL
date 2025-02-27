import React from "react";
import { Link, useNavigate } from "react-router-dom";
// React Icons (install with `npm install react-icons`)
import {
  FaTachometerAlt,
  FaSchool,
  FaChalkboardTeacher,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const Sidebar = () => {
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async (e) => {
    e.preventDefault(); // prevent default anchor behavior

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // No token found, just navigate to login or handle accordingly
        navigate("/login");
        return;
      }

      // Call your Flask /logout endpoint
      const resp = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Whether successful or not, remove local token
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      // If resp is OK, the user is logged out. 
      // Navigate to the login page or wherever you want
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, remove local token & go to login
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#1B1F3B", // dark blue background
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex flex-column p-3" style={{ height: "100%" }}>
        {/* Top Brand / Admin Label */}
        <h5 className="mb-4 text-white">Admin</h5>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto">
          {/* Dashboard */}
          <li className="nav-item mb-2">
            <Link to="/admin" className="nav-link text-white">
              <FaTachometerAlt className="me-2" />
              Dashboard
            </Link>
          </li>
          {/* Manage Schools */}
          <li className="nav-item mb-2">
            <Link to="/schools" className="nav-link text-white">
              <FaSchool className="me-2" />
              Manage Schools
            </Link>
          </li>
          {/* Teachers */}
          <li className="nav-item mb-2">
            <Link to="/teachers" className="nav-link text-white">
              <FaChalkboardTeacher className="me-2" />
              Manage Teachers
            </Link>
          </li>
          {/* Students */}
          <li className="nav-item mb-2">
            <Link to="/students" className="nav-link text-white">
              <FaUsers className="me-2" />
              Students
            </Link>
          </li>
          {/* Settings */}
          <li className="nav-item mb-2">
            <Link to="/settings" className="nav-link text-white">
              <FaCog className="me-2" />
              Settings
            </Link>
          </li>
        </ul>

        {/* Logout at the bottom */}
        <div className="mt-auto">
          {/* Use an <a> or a button for logout */}
          <a href="#logout" onClick={handleLogout} className="nav-link text-danger">
            <FaSignOutAlt className="me-2" />
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
