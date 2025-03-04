import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

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
        {/* Top Header Row */}
        <div className="d-flex align-items-center justify-content-between mb-3 text-white">
          <div>
            <small>Admin &gt; Dashboard</small>
          </div>
          <div className="d-flex align-items-center">
            {/* Create School button at the far top right */}
            <Link to="/createschool" className="btn btn-success me-3">
              Create School
            </Link>
            <span className="me-2">Admin User</span>
            <img
              src="/Avatar--Streamline-Radix.svg" // placeholder user avatar
              alt="Admin Avatar"
              className="rounded-circle"
              style={{ width: "45px", height: "45px" }}
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
                    {/* Link to the Create School route */}
                    <Link
                      to="/createschool"
                      className="btn w-100"
                      style={{ backgroundColor: "#32407B", color: "#FFF" }}
                    >
                      <FaPlusSquare className="me-1" />
                      Add New School
                    </Link>
                  </div>
                  <div className="col-6 mb-3">
                    {/* Link to a Teacher creation route (example: /create-teacher) */}
                    <Link
                      to="/teachers"
                      className="btn w-100"
                      style={{ backgroundColor: "#1F7D56", color: "#FFF" }}
                    >
                      <FaUserPlus className="me-1" />
                      Add New Teacher
                    </Link>
                  </div>
                  <div className="col-6 mb-3">
                    {/* Link to settings (example: /settings) */}
                    <Link
                      to="/settings"
                      className="btn w-100"
                      style={{ backgroundColor: "#5F409A", color: "#FFF" }}
                    >
                      <FaWrench className="me-1" />
                      Settings
                    </Link>
                  </div>
                  <div className="col-6 mb-3">
                    {/* Link to a "Download Report" page or trigger a download */}
                    <Link
                      to=""
                      className="btn w-100"
                      style={{ backgroundColor: "#80572F", color: "#FFF" }}
                    >
                      <FaDownload className="me-1" />
                      Download Report
                    </Link>
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

        {/* Replace Recent Activity with something else, e.g., "Upcoming Events" */}
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
                Upcoming Events
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>Parent-Teacher Conference:</strong> March 10{" "}
                    <small className="text-muted">in 2 days</small>
                  </li>
                  <li className="mb-2">
                    <strong>Annual Sports Day:</strong> April 15{" "}
                    <small className="text-muted">in 1 month</small>
                  </li>
                  <li>
                    <strong>Teacher Training Workshop:</strong> May 5{" "}
                    <small className="text-muted">in 2 months</small>
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
