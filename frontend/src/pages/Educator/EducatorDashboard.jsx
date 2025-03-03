import React from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaBook,
  FaUsers,
  FaComments,
  FaPen,
  FaSignOutAlt,
} from "react-icons/fa";

const EducatorDashboard = () => {
  return (
    <div
      className="position-relative min-vh-100"
      style={{
        background:
          'url("https://via.placeholder.com/1500") center center / cover no-repeat',
      }}
    >
      {/* -- Overlay for better readability -- */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
        style={{ opacity: 0.7, zIndex: 0 }}
      ></div>

      {/* -- Sidebar -- */}
      <aside
        className="bg-dark text-white p-4 shadow-lg position-fixed h-100 d-flex flex-column justify-content-between"
        style={{ width: "240px", zIndex: 1 }}
      >
        <div>
          <h2 className="fs-4 fw-bold text-end mb-4">Dashboard</h2>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link
                to="/educator/attendance"
                className="nav-link text-white d-flex align-items-center px-2 py-2"
              >
                <FaClipboardList className="me-2" /> Take Attendance
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                to="/educator/resources"
                className="nav-link text-white d-flex align-items-center px-2 py-2"
              >
                <FaBook className="me-2" /> Manage Resources
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                to="/educator/permissions"
                className="nav-link text-white d-flex align-items-center px-2 py-2"
              >
                <FaUsers className="me-2" /> Set Permissions
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                to="/educator/chat"
                className="nav-link text-white d-flex align-items-center px-2 py-2"
              >
                <FaUsers className="me-2" /> Classes
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                to="/educator/exams"
                className="nav-link text-white d-flex align-items-center px-2 py-2"
              >
                <FaPen className="me-2" /> Create Exams
              </Link>
            </li>
          </ul>
        </div>

        {/* -- Logout Button at Bottom -- */}
        <div className="mt-auto">
          <Link
            to="/logout"
            className="nav-link text-danger d-flex align-items-center px-2 py-2"
          >
            <FaSignOutAlt className="me-2" /> Logout
          </Link>
        </div>
      </aside>

      {/* -- Main Content -- */}
      <main
        className="text-white p-4 position-relative"
        style={{ marginLeft: "240px", zIndex: 1 }}
      >
        {/* -- Profile Picture on the Right Side -- */}
        <div className="position-absolute top-0 end-0 p-3">
          <img
            src="https://via.placeholder.com/50"
            alt="Profile"
            className="rounded-circle border border-light"
            style={{ width: "50px", height: "50px" }}
          />
        </div>

        {/* -- Welcome Banner -- */}
        <div className="bg-dark shadow p-5 mb-5 text-center">
          <h1 className="display-4 fw-bold mb-2">Welcome, Educator</h1>
          <p className="text-muted">
            Manage your class, attendance, resources, and more!
          </p>
        </div>

        {/* -- Quick Action Cards -- */}
        <div className="container-fluid">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {/* Take Attendance Card */}
            <div className="col">
              <Link to="/educator/attendance" className="text-decoration-none">
                <div
                  className="card bg-dark text-white h-100"
                  style={{ borderTop: "4px solid #ffc107" }}
                >
                  <div className="card-body text-center">
                    <FaClipboardList className="display-4 text-warning" />
                    <p className="card-text mt-3 fw-semibold">
                      Take Attendance
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Manage Resources Card */}
            <div className="col">
              <Link to="/educator/resources" className="text-decoration-none">
                <div
                  className="card bg-dark text-white h-100"
                  style={{ borderTop: "4px solid #28a745" }}
                >
                  <div className="card-body text-center">
                    <FaBook className="display-4" style={{ color: "#28a745" }} />
                    <p className="card-text mt-3 fw-semibold">
                      Manage Resources
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Set Permissions Card */}
            <div className="col">
              <Link to="/educator/permissions" className="text-decoration-none">
                <div
                  className="card bg-dark text-white h-100"
                  style={{ borderTop: "4px solid #0d6efd" }}
                >
                  <div className="card-body text-center">
                    <FaUsers className="display-4 text-primary" />
                    <p className="card-text mt-3 fw-semibold">
                      Set Permissions
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Class Chat Card */}
            <div className="col">
              <Link to="/educator/chat" className="text-decoration-none">
                <div
                  className="card bg-dark text-white h-100"
                  style={{ borderTop: "4px solid #6f42c1" }}
                >
                  <div className="card-body text-center">
                    <FaComments
                      className="display-4"
                      style={{ color: "#6f42c1" }}
                    />
                    <p className="card-text mt-3 fw-semibold">Class Chat</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Create Exams Card */}
            <div className="col">
              <Link to="/educator/exams" className="text-decoration-none">
                <div
                  className="card bg-dark text-white h-100"
                  style={{ borderTop: "4px solid #dc3545" }}
                >
                  <div className="card-body text-center">
                    <FaPen className="display-4 text-danger" />
                    <p className="card-text mt-3 fw-semibold">Create Exams</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorDashboard;
