import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SchoolContext } from "../../context/SchoolContext"; // Ensure this file exists
import { Button, Form, Container, Row, Col, Alert } from "react-bootstrap"; 
import "bootstrap/dist/css/bootstrap.min.css"; // Add this if missing
import "./Auth.css"; 

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [schoolId, setSchoolId] = useState('');
  const [error, setError] = useState('');
  const { schools } = useContext(SchoolContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before submission

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, schoolId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      alert("Signup Successful!");

      if (role === 'teacher') navigate('/dashboard/teacher');
      else if (role === 'student') navigate('/dashboard/student');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <div className="auth-box p-4">
            <h2 className="text-center">Signup</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </Form.Select>
              </Form.Group>

              {(role === 'teacher' || role === 'student') && (
                <Form.Group className="mb-3">
                  <Form.Label>Select School</Form.Label>
                  <Form.Select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Button className="w-100" type="submit">
                Signup
              </Button>
            </Form>

            <div className="text-center mt-3">
              <p>
                Already have an account? <a href="/login" className="text-decoration-none">Login</a>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
