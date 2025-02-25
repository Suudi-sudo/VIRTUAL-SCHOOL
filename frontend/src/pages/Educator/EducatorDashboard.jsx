"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const EducatorDashboard = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex">
      {/* Sidebar */}
      <nav className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="text-center">Educator Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/educator" className="nav-link text-white">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/educator/attendance" className="nav-link text-white">
              Take Attendance
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/educator/resources" className="nav-link text-white">
              Manage Resources
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="mb-4">Welcome, Educator! 🎓</h2>
        
        {/* Stats Overview */}
        <div className="row">
          <div className="col-md-4">
            <div className="card bg-primary text-white text-center p-4">
              <h5>Total Students</h5>
              <h2>150</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white text-center p-4">
              <h5>Attendance Rate</h5>
              <h2>92%</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-warning text-dark text-center p-4">
              <h5>Resources Uploaded</h5>
              <h2>32</h2>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-5">
          <h4>Quick Actions</h4>
          <div className="d-flex gap-3">
            <Link to="/educator/attendance" className="btn btn-lg btn-primary">
              📋 Take Attendance
            </Link>
            <Link to="/educator/resources" className="btn btn-lg btn-success">
              📂 Manage Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
