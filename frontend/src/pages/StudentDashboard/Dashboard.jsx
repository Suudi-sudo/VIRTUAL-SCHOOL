import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// React Icons
import { 
  FaHome, 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaFileAlt, 
  FaComments, 
  FaSignOutAlt 
} from 'react-icons/fa';
import LogoutButton from '../../components/Logout';

function StudentsDashboard() {
  const navigate = useNavigate();

  // Handle logout by POSTing to /logout and removing token
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('/logout', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: '100vh',
        backgroundColor: '#1B1F3B', // Dark background for entire app
      }}
    >
      {/* Sidebar */}
      <div
        className="p-3 text-white d-flex flex-column align-items-center"
        style={{
          width: '250px',
          borderRight: '1px solid #444',
          borderTop: '1px solid #444',
          borderBottom: '2px solid #444',
        }}
      >
        <h4 className="mb-4">Virtual School</h4>
        <ul className="list-unstyled w-100">
          <li className="mb-3">
            <Link
              to="/student/dashboard"
              className="text-white text-decoration-none d-flex align-items-center"
            >
              <FaHome className="me-2" />
              Dashboard
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to=""
              className="text-white text-decoration-none d-flex align-items-center"
            >
              <FaChalkboardTeacher className="me-2" />
              My Classes
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to="/study-material"
              className="text-white text-decoration-none d-flex align-items-center"
            >
              <FaBookOpen className="me-2" />
              Resources
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to="/exam"
              className="text-white text-decoration-none d-flex align-items-center"
            >
              <FaFileAlt className="me-2" />
              Assessments
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to="/chat"
              className="text-white text-decoration-none d-flex align-items-center"
            >
              <FaComments className="me-2" />
              Class Chat
            </Link>
          </li>
        </ul>
        <hr className="border-secondary w-100" />
        {/* Logout Link calling handleLogout */}
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 text-white p-4"
        style={{ overflowY: 'auto' }}
      >
        {/* Top Bar / Header */}
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ borderBottom: '1px solid #444' }}
        >
          <h4 className="mb-0">Student's Dashboard</h4>
          <div className="d-flex align-items-center">
            <span className="me-3">Your Profile</span>
            <img
              src="/avatar-4bp848qne6e50utunybrxx.webp"
              alt="Profile"
              className="rounded-circle"
              width="40"
              height="40"
            />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Row className="mt-3 g-4">
          <Col md={4}>
            <Card
              className="text-white border border-secondary shadow"
              style={{ backgroundColor: '#2E447C' }}  // A different shade of blue
            >
              <Card.Body>
                <Card.Title>Today's Classes</Card.Title>
                <Card.Text>Mathematics 101 - 2:30 PM Today</Card.Text>
                <Card.Text>Physics 201 - 4:00 PM Today</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-white border border-secondary shadow"
              style={{ backgroundColor: '#2E447C' }}
            >
              <Card.Body>
                <Card.Title>Upcoming Assignments</Card.Title>
                <Card.Text>Math Homework (Due: Today)</Card.Text>
                <Card.Text>Physics Lab Report (Due: Tomorrow)</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-white border border-secondary shadow"
              style={{ backgroundColor: '#2E447C' }}
            >
              <Card.Body>
                <Card.Title>Recent Resources</Card.Title>
                <Card.Text>Math Formulas (2 hours ago)</Card.Text>
                <Card.Text>Physics Notes (Yesterday)</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4 g-4">
          <Col md={6}>
            <Card
              className="text-white border border-secondary shadow"
              style={{ backgroundColor: '#2E447C' }}
            >
              <Card.Body>
                <Card.Title>Your Classes</Card.Title>
                <div className="mb-3">
                  <h6>Mathematics 101</h6>
                  <p className="mb-1">Dr. Smith</p>
                  <small>2:30 PM Today</small>
                  <div className="mt-2">
                    <Button variant="secondary" size="sm" className="me-2">
                      Resources
                    </Button>
                    <Button variant="primary" size="sm">
                      Chat
                    </Button>
                  </div>
                </div>
                <hr />
                <div>
                  <h6>Physics 201</h6>
                  <p className="mb-1">Prof. Johnson</p>
                  <small>4:00 PM Today</small>
                  <div className="mt-2">
                    <Button variant="secondary" size="sm" className="me-2">
                      Resources
                    </Button>
                    <Button variant="primary" size="sm">
                      Chat
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card
              className="text-white border border-secondary shadow"
              style={{ backgroundColor: '#2E447C' }}
            >
              <Card.Body>
                <Card.Title>Recent Activity</Card.Title>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    Completed Math Quiz (1 hour ago)
                  </li>
                  <li>
                    Downloaded Physics Notes (3 hours ago)
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default StudentsDashboard;
