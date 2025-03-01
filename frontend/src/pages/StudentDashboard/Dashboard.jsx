import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function StudentsDashboard() {
  return (
    <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
      <Row noGutters>
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2} className="bg-dark text-white vh-100" style={{ minHeight: '100vh' }}>
          <div className="p-3">
            <h4 className="mb-4">Virtual </h4>
            <ul className="list-unstyled">
              <li className="mb-3">
                <Link to="/student/dashboard" className="text-white text-decoration-none">Dashboard</Link>
              </li>
              <li className="mb-3">
                <Link to="/classes" className="text-white text-decoration-none">My Classes</Link>
              </li>
              <li className="mb-3">
                <Link to="/resources" className="text-white text-decoration-none">Resources</Link>
              </li>
              <li className="mb-3">
                <Link to="/attendance" className="text-white text-decoration-none">Attendance</Link>
              </li>
              <li className="mb-3">
                <Link to="/assessments" className="text-white text-decoration-none">Assessments</Link>
              </li>
              <li className="mb-3">
                <Link to="/chat" className="text-white text-decoration-none">Class Chat</Link>
              </li>
            </ul>
            <hr />
            <Link to="/logout" className="text-white text-decoration-none">Sign Out</Link>
          </div>
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="bg-light">
          {/* Top Bar / Header */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h4 className="mb-0">Student's Dashboard</h4>
            <div className="d-flex align-items-center">
              <span className="me-3">Your Profile</span>
              <img 
                src="/avatar-4bp848qne6e50utunybrxx.webp" 
                alt="Profile" 
                className="rounded-circle" 
                width="40" height="40"
              />
            </div>
          </div>

          {/* Main Dashboard Content */}
          <Container className="mt-4">
            <h5>Here's what's happening today</h5>
            <Row className="mt-3">
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Today's Classes</Card.Title>
                    <Card.Text>Mathematics 101 - 2:30 PM Today</Card.Text>
                    <Card.Text>Physics 201 - 4:00 PM Today</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Upcoming Assignments</Card.Title>
                    <Card.Text>Math Homework (Due: Today)</Card.Text>
                    <Card.Text>Physics Lab Report (Due: Tomorrow)</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Recent Resources</Card.Title>
                    <Card.Text>Math Formulas (2 hours ago)</Card.Text>
                    <Card.Text>Physics Notes (Yesterday)</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Your Classes</Card.Title>
                    <div className="mb-3">
                      <h6>Mathematics 101</h6>
                      <p className="mb-1">Dr. Smith</p>
                      <small>2:30 PM Today</small>
                      <div className="mt-2">
                        <Button variant="secondary" size="sm" className="me-2">Resources</Button>
                        <Button variant="primary" size="sm">Chat</Button>
                      </div>
                    </div>
                    <hr />
                    <div>
                      <h6>Physics 201</h6>
                      <p className="mb-1">Prof. Johnson</p>
                      <small>4:00 PM Today</small>
                      <div className="mt-2">
                        <Button variant="secondary" size="sm" className="me-2">Resources</Button>
                        <Button variant="primary" size="sm">Chat</Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Recent Activity</Card.Title>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Completed Math Quiz (1 hour ago)
                      </li>
                      <li>
                        <i className="bi bi-download text-primary me-2"></i>
                        Downloaded Physics Notes (3 hours ago)
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentsDashboard;
