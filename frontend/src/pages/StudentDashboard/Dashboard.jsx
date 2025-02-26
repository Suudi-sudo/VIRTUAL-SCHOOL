import React from 'react';
import { Link } from 'react-router-dom';
import GradeSummary from './GradeSummary';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaBook, FaComments, FaGraduationCap, FaBell } from 'react-icons/fa';

const StudentDashboard = () => {
  // Mock data (replace with actual data from your backend)
  const studentName = "big  mac ";
  const upcomingExams = [
    { id: 1, subject: "Mathematics", date: "2023-06-15" },
    { id: 2, subject: "Science", date: "2023-06-18" },
  ];
  const recentAnnouncements = [
    { id: 1, title: "Graduation", date: "2025-05-10" },
    { id: 2, title: "Summer Break Schedule", date: "2023-06-05" },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link to="/student/profile" className="nav-link"><FaUser /> Profile</Link>
              </li>
              <li className="nav-item">
                <Link to="/student/exam" className="nav-link"><FaGraduationCap /> Exam</Link>
              </li>
              <li className="nav-item">
                <Link to="/student/chat" className="nav-link"><FaComments /> Chat</Link>
              </li>
              <li className="nav-item">
                <Link to="/student/study-material" className="nav-link"><FaBook /> Study Material</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Welcome, {studentName}</h1>
          </div>

          <div className="row">
            <div className="col-md-6">
              <GradeSummary />
            </div>
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header">
                  <h5><FaGraduationCap /> Upcoming Exams</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {upcomingExams.map(exam => (
                    <li key={exam.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {exam.subject}
                      <span className="badge bg-primary rounded-pill">{exam.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5><FaBell /> Recent Announcements</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {recentAnnouncements.map(announcement => (
                    <li key={announcement.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {announcement.title}
                      <span className="badge bg-secondary rounded-pill">{announcement.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;