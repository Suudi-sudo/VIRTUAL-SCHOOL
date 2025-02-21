import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SchoolProvider } from './context/SchoolContext';
import { ChatProvider } from './context/ChatContext';
import Homepage from './pages/Homepage/Homepage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
// import StudentProfile from './pages/profile/StudentProfile';
// import TeacherProfile from './pages/profile/TeacherProfile';
// import OwnerProfile from './pages/profile/OwnerProfile';
import StudentChat from './pages/chat/StudentChat';
// ... Import other pages as needed

const App = () => {
  return (
    <AuthProvider>
      <SchoolProvider>
        <ChatProvider>
          <Router>
            <Routes>
              {/* Homepage Route */}
              <Route path="/" element={<Homepage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
              <Route path="/dashboard/owner" element={<OwnerDashboard />} />

              {/* Profile Routes */}
              {/* <Route path="/profile/student" element={<StudentProfile />} />
              <Route path="/profile/teacher" element={<TeacherProfile />} />
              <Route path="/profile/owner" element={<OwnerProfile />} /> */}

              {/* Chat Routes */}
              <Route path="/chat/student" element={<StudentChat />} />
              
              {/* Add more routes as needed */}
            </Routes>
          </Router>
        </ChatProvider>
      </SchoolProvider>
    </AuthProvider>
  );
};

export default App;
