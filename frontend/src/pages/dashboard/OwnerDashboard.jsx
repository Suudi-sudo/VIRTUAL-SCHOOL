import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const OwnerDashboard = () => {
  const links = [
    { path: '/owner/managedschools', label: 'Manage Schools' },
    { path: '/owner/manageteachers', label: 'Manage Teachers' },
    { path: '/owner/viewstudents', label: 'View Students' },
    { path: '/owner/profile', label: 'Profile' },
  ];

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar links={links} />
        <div className="dashboard-content">
          <h1>Owner Dashboard</h1>
          {/* Owner dashboard content */}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
