import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase"; // Ensure Firebase is configured
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [owners, setOwners] = useState([]); // Stores owners fetched from the backend
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch owners from backend
    const fetchOwners = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/owners");
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch owners");
        setOwners(data);
      } catch (error) {
        console.error("Error fetching owners:", error.message);
      }
    };

    fetchOwners();
  }, []);

  // Google Sign-In Function
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Google sign-in successful");
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  // Email & Password Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);

      // Redirect users based on role
      const userRole = data.role;
      if (userRole === "owner") {
        window.location.href = "/dashboard/owner";
      } else if (userRole === "teacher") {
        window.location.href = "/dashboard/teacher";
      } else if (userRole === "student") {
        window.location.href = "/dashboard/student";
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <div className="text-center">
            <Button className="w-100 google-btn" onClick={handleGoogleLogin}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                alt="Google Logo"
                className="me-2"
                style={{ width: "20px" }}
              />
              Continue with Google
            </Button>
            <p className="my-3">or</p>
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          <Form onSubmit={handleLogin}>
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

            <Button className="w-100 login-btn" type="submit">
              Log in
            </Button>
          </Form>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">Use single sign-on</a> <br />
            <a href="#" className="text-decoration-none">Reset password</a> <br />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
