import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const StudentDashboard = () => {
  const studentLinks = [
    { path: '/dashboard/student', label: 'Dashboard' },
    { path: '/student/profile', label: 'Profile' },
    { path: '/student/attendance', label: 'Attendance' },
    { path: '/student/materials', label: 'Study Materials' },
    { path: '/student/assessments', label: 'Assessments' },
    { path: '/student/chat', label: 'Student Chat' },
  ];

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar links={studentLinks} />
        <div className="dashboard-content">
          <h1>Student Dashboard</h1>
          <p>Welcome to the Student Dashboard. Here, you can manage your academic activities and resources.</p>
          <p>
            <strong>Key Features:</strong>
            <ul>
              <li>View your attendance records.</li>
              <li>Access study materials and resources.</li>
              <li>Participate in assessments and quizzes.</li>
              <li>Communicate with your teachers through the student chat.</li>
            </ul>
          </p>          
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
