import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Profile from './Profile';
import Exam from './Exam';
import Chat from './Chat';
import StudyMaterial from './StudyMaterial';
import GradeSummary from './GradeSummary';

const StudentDashboard = () => {
  return (
    <Router>
      <div className="dashboard">
        <nav className="sidebar">
          <ul>
            <li><Link to="/student/profile">Profile</Link></li>
            <li><Link to="/student/exam">Exam</Link></li>
            <li><Link to="/student/chat">Chat</Link></li>
            <li><Link to="/student/study-material">Study Material</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <GradeSummary />
          <Routes>
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/exam" element={<Exam />} />
            <Route path="/student/chat" element={<Chat />} />
            <Route path="/student/study-material" element={<StudyMaterial />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default StudentDashboard;