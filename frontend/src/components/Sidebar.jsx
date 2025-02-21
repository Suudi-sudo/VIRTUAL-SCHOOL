import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  // Define links for both teachers and students
  const links = [
    { path: "/dashboard/teacher", label: "Teacher Dashboard" },
    { path: "/teacher/profile", label: "Teacher Profile" },
    { path: "/teacher/attendance", label: "Attendance" },
    { path: "/teacher/studymaterials", label: "Study Materials" },
    { path: "/teacher/assessments", label: "Assessments" },
    { path: "/teacher/managepermissions", label: "Manage Permissions" },
    { path: "/teacher/classchat", label: "Class Chat" },

    { path: "/dashboard/student", label: "Student Dashboard" },
    { path: "/student/profile", label: "Student Profile" },
    { path: "/student/attendance", label: "Attendance" },
    { path: "/student/materials", label: "Study Materials" },
    { path: "/student/assessments", label: "Assessments" },
    { path: "/student/chat", label: "Student Chat" },
  ];

  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        {links.map((link, idx) => (
          <li key={idx}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
