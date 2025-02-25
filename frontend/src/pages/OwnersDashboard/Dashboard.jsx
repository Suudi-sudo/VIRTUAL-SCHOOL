import React from "react";
import Sidebar from "./Sidebar";

// OPTIONAL: Install React Icons if you want these icons:
// npm install react-icons
import {
  FaSchool,
  FaChalkboardTeacher,
  FaUserFriends,
  FaClock,
  FaPlusSquare,
  FaUserPlus,
  FaWrench,
  FaDownload,
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#1B1F3B", // Dark background for entire app
      }}
    >
      {/* Sidebar (dark) */}
      <Sidebar />

      {/* Main Content Area (slightly lighter dark) */}
      <div className="flex-grow-1 p-3" style={{ backgroundColor: "#24294B" }}>
        {/* Top Breadcrumb / Header row */}
        <div className="d-flex align-items-center justify-content-between mb-3 text-white">
          <div>
            <small>Admin &gt; Dashboard</small>
          </div>
          <div>
            <span className="me-2">Admin User</span>
            <img
              src="https://via.placeholder.com/30" // placeholder user avatar
              alt="Admin Avatar"
              className="rounded-circle"
            />
          </div>
        </div>

        {/* Main Header Card */}
        <div
          className="mb-4 p-4"
          style={{
            backgroundColor: "#2F3457",
            borderRadius: "8px",
            color: "#FFF",
          }}
        >
          <h2 className="fw-bold">
            Welcome to School Administration Dashboard
          </h2>
          <p className="mb-0">
            Manage your educational institution efficiently with our comprehensive
            admin dashboard. Monitor schools, teachers, and key metrics all in one
            place.
          </p>
        </div>

        {/* Stats Row */}
        <div className="row">
          {/* Total Schools */}
          <div className="col-md-3 mb-3">
            <div
              className="card h-100 text-white text-center"
              style={{ backgroundColor: "#343B6D" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <FaSchool size={28} className="mb-2" />
                <h6>Total Schools</h6>
                <h3>0</h3>
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="col-md-3 mb-3">
            <div
              className="card h-100 text-white text-center"
              style={{ backgroundColor: "#343B6D" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <FaChalkboardTeacher size={28} className="mb-2" />
                <h6>Total Teachers</h6>
                <h3>0</h3>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="col-md-3 mb-3">
            <div
              className="card h-100 text-white text-center"
              style={{ backgroundColor: "#343B6D" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <FaUserFriends size={28} className="mb-2" />
                <h6>Active Users</h6>
                <h3>250+</h3>
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="col-md-3 mb-3">
            <div
              className="card h-100 text-white text-center"
              style={{ backgroundColor: "#343B6D" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <FaClock size={28} className="mb-2" />
                <h6>System Uptime</h6>
                <h3>99.9%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions + System Overview */}
        <div className="row">
          {/* Quick Actions */}
          <div className="col-md-6 mb-3">
            <div
              className="card h-100"
              style={{ backgroundColor: "#2F3457", color: "#FFF" }}
            >
              <div
                className="card-header"
                style={{ backgroundColor: "transparent", borderBottom: "1px solid #474D75" }}
              >
                Quick Actions
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <button
                      className="btn w-100"
                      style={{ backgroundColor: "#32407B", color: "#FFF" }}
                    >
                      <FaPlusSquare className="me-1" />
                      Add New School
                    </button>
                  </div>
                  <div className="col-6 mb-3">
                    <button
                      className="btn w-100"
                      style={{ backgroundColor: "#1F7D56", color: "#FFF" }}
                    >
                      <FaUserPlus className="me-1" />
                      Add New Teacher
                    </button>
                  </div>
                  <div className="col-6 mb-3">
                    <button
                      className="btn w-100"
                      style={{ backgroundColor: "#5F409A", color: "#FFF" }}
                    >
                      <FaWrench className="me-1" />
                      Settings
                    </button>
                  </div>
                  <div className="col-6 mb-3">
                    <button
                      className="btn w-100"
                      style={{ backgroundColor: "#80572F", color: "#FFF" }}
                    >
                      <FaDownload className="me-1" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="col-md-6 mb-3">
            <div
              className="card h-100"
              style={{ backgroundColor: "#2F3457", color: "#FFF" }}
            >
              <div
                className="card-header"
                style={{ backgroundColor: "transparent", borderBottom: "1px solid #474D75" }}
              >
                System Overview
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <span>System Status</span>
                  <span style={{ color: "green" }}>Operational</span>
                </div>
                <hr style={{ borderColor: "#474D75" }} />
                <div className="d-flex justify-content-between">
                  <span>Last Backup</span>
                  <span>2 hours ago</span>
                </div>
                <hr style={{ borderColor: "#474D75" }} />
                <div className="d-flex justify-content-between">
                  <span>Next Update</span>
                  <span>In 5 days</span>
                </div>
                <hr style={{ borderColor: "#474D75" }} />
                <div className="d-flex justify-content-between">
                  <span>Storage Used</span>
                  <span>45.5 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-12">
            <div
              className="card"
              style={{ backgroundColor: "#2F3457", color: "#FFF" }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: "transparent",
                  borderBottom: "1px solid #474D75",
                }}
              >
                Recent Activity
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>New school added:</strong> Lincoln High School{" "}
                    <small className="text-muted">2 hours ago</small>
                  </li>
                  <li className="mb-2">
                    <strong>New teacher registered:</strong> Sarah Johnson{" "}
                    <small className="text-muted">4 hours ago</small>
                  </li>
                  <li>
                    <strong>School details updated:</strong> Washington Elementary{" "}
                    <small className="text-muted">6 hours ago</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
