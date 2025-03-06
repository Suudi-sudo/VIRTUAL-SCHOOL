import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaFolderOpen,
  FaUsersCog,
  FaComments,
  FaPencilAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const Sidebar = () => {
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // No token found, go to login (or handle otherwise)
        navigate("/login");
        return;
      }

      // Call your Flask logout endpoint
      const resp = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove token either way
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      // If resp is OK, user is logged out
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if an error occurs, remove token & go to login
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      navigate("/");
    }
  };

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#13151b", // dark sidebar background
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex flex-column p-3" style={{ height: "100%" }}>
        {/* Sidebar Title */}
        <h5 className="mb-4 text-white">Dashboard</h5>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2">
            <Link to="/attendance" className="nav-link text-white">
              <FaCalendarCheck className="me-2" />
              Take Attendance
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/resources" className="nav-link text-white">
              <FaFolderOpen className="me-2" />
              Manage Resources
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/permissions" className="nav-link text-white">
              <FaUsersCog className="me-2" />
              Set Permissions
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/chat" className="nav-link text-white">
              <FaComments className="me-2" />
              Class Chat
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/exams" className="nav-link text-white">
              <FaPencilAlt className="me-2" />
              Create Exams
            </Link>
          </li>
        </ul>

        {/* Logout at the bottom */}
        <div className="mt-auto">
          <a
            href="#logout"
            onClick={handleLogout}
            className="nav-link text-danger"
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
