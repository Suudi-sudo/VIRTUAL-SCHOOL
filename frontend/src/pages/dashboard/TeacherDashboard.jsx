import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
// import './TeacherDashboard.css'; // Import the new CSS file

const TeacherDashboard = () => {
  const teacherLinks = [
    { path: '/dashboard/teacher', label: 'Dashboard' },
    { path: '/teacher/profile', label: 'Profile' },
    { path: '/teacher/attendance', label: 'Attendance' },
    { path: '/teacher/studymaterials', label: 'Study Materials' },
    { path: '/teacher/assessments', label: 'Assessments' },
    { path: '/teacher/managepermissions', label: 'Manage Permissions' },
    { path: '/teacher/classchat', label: 'Class Chat' },
  ];

  return (
    <div className="teacher-dashboard">
      {/* Top Navbar */}
      <Navbar />

      <div className="dashboard-container">
        {/* Left Sidebar */}
        <Sidebar links={teacherLinks} />

        {/* Main Content */}
        <div className="dashboard-content">
          <h1 className="page-title">Teacher Dashboard</h1>

          {/* Course Description */}
          <div className="course-description">
            <p>
              Introduction to Data Science, you will guide students through foundational concepts in data analysis,
              Python programming, and statistical modeling. Through hands-on projects and interactive lessons, students
              gain the necessary tools to excel in the data-driven era, preparing them for careers in AI, machine
              learning, and analytics.
            </p>
          </div>

          {/* Stats Section */}
          <div className="stats">
            <div className="stat-card">
              <h2>Total Students</h2>
              <p className="count">46</p>
            </div>

            <div className="stat-card">
              <h2>Completed Topics</h2>
              <ul className="topics">
                <li>Introduction ✅</li>
                <li>Simple CSS ✅</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
