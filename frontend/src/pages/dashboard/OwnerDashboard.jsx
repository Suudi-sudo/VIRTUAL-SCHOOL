import React, { useContext } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { SchoolContext } from '../../context/SchoolContext';
import { AuthContext } from '../../context/AuthContext';
// import '../../styles/OwnerDashboard.css';

const OwnerDashboard = () => {
  const links = [
    { path: '/owner/manageschools', label: 'Manage Schools' },
    { path: '/owner/manageteachers', label: 'Manage Teachers' },
    { path: '/owner/viewstudents', label: 'View Students' },
    { path: '/owner/profile', label: 'Profile' },
  ];

  const { schools } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  if (user?.role !== 'owner') {
    return <h2 className="access-denied">Access Denied. Only owners can view this page.</h2>;
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar links={links} />
        <div className="dashboard-content">
          <h1>Welcome, {user?.name || 'Owner'}!</h1>
          <p className="dashboard-subtitle">Manage your schools, teachers, and students efficiently.</p>

          <div className="school-overview">
            <h2>School Overview</h2>
            <div className="school-list">
              {schools.map((school) => (
                <div key={school.id} className="school-card">
                  <h4>{school.name}</h4>
                  <p>👨‍🏫 Teachers: {school.teacherCount}</p>
                  <p>🎓 Students: {school.studentCount}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
