import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaBook,
  FaUsers,
  FaComments,
  FaPen,
  FaSignOutAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const dashboardCards = [
  { path: "/educator/attendance", icon: <FaClipboardList className="text-warning" />, label: "Take Attendance", borderColor: "#ffc107" },
  { path: "/educator/resources", icon: <FaBook className="text-success" />, label: "Manage Resources", borderColor: "#28a745" },
  { path: "/educator/permissions", icon: <FaUsers className="text-primary" />, label: "Set Permissions", borderColor: "#0d6efd" },
  { path: "/educator/chat", icon: <FaComments className="text-purple-600" />, label: "Class Chat", borderColor: "#6f42c1" },
  { path: "/educator/exams", icon: <FaPen className="text-danger" />, label: "Create Exams", borderColor: "#dc3545" },
];

const EducatorDashboard = () => {
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Remove local storage token & navigate to home
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      if (!token) {
        navigate("/"); // Redirect to Home Page
        return;
      }

      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/"); // Redirect to Home Page after logout
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/"); // Even if error occurs, go to home
    }
  };

  return (
    <div
      className="position-relative min-vh-100"
      style={{
        background: 'url("https://via.placeholder.com/1500") center center / cover no-repeat',
      }}
    >
    
      {/* -- Overlay for better readability -- */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.7, zIndex: 0 }}></div>

      {/* -- Sidebar -- */}
      <aside
        className="bg-dark text-white p-4 shadow-lg position-fixed h-100 d-flex flex-column justify-content-between"
        style={{ width: "240px", zIndex: 1 }}
      >
        <div>
          <h2 className="fs-4 fw-bold text-end mb-4">Dashboard</h2>
          <ul className="nav flex-column">
            {dashboardCards.map(({ path, icon, label }, index) => (
              <li key={index} className="nav-item mb-2">
                <Link to={path} className="nav-link text-white d-flex align-items-center px-2 py-2">
                  {icon} <span className="ms-2">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* -- Logout at the bottom -- */}
        <div>
          <a href="#logout" onClick={handleLogout} className="nav-link text-danger d-flex align-items-center">
            <FaSignOutAlt className="me-2" />
            Logout
          </a>
        </div>
      </aside>

      {/* -- Main Content -- */}
      <main className="text-white p-4 position-relative" style={{ marginLeft: "240px", zIndex: 1 }}>
        {/* -- Profile Picture on the Right Side -- */}
        <div className="position-absolute top-0 end-0 p-3">
          <img
            src="/Avatar--Streamline-Radix.svg"
            alt="Profile"
            className="rounded-circle border border-light"
            style={{ width: "50px", height: "50px" }}
          />
        </div>

        {/* -- Welcome Banner -- */}
        <div className="bg-dark shadow p-5 mb-5 text-center">
          <h1 className="display-4 fw-bold mb-2">Welcome, Educator</h1>
          <p className="text-muted">Manage your class, attendance, resources, and more!</p>
        </div>

        {/* -- Quick Action Cards -- */}
        <div className="container-fluid">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {dashboardCards.map(({ path, icon, label, borderColor }, index) => (
              <div key={index} className="col">
                <Link to={path} className="text-decoration-none">
                  <div className="card bg-dark text-white h-100" style={{ borderTop: `4px solid ${borderColor}` }}>
                    <div className="card-body text-center">
                      <div className="display-4">{icon}</div>
                      <p className="card-text mt-3 fw-semibold">{label}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorDashboard;
