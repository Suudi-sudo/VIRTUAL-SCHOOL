import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import ErrorBoundary from "../../ErrorBoundary";

const Login = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student", // Add role to formData
  });
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setMessage("Login successful!");
      } else {
        setMessage(data.msg);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Handle Google login
  const google_login = async (token) => {
    try {
      const user_details = jwtDecode(token);
      console.log("Google user", user_details);

      // Send the Google user details to your backend
      const response = await fetch("http://127.0.0.1:5000/google_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user_details.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMessage("Google login successful!");
      } else {
        setMessage(data.msg || "Failed to login with Google.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login to Your Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {message && (
                  <div className="alert alert-success text-center">{message}</div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Role Selection Dropdown */}
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select form-select-lg"
                    >
                      <option value="student">Student</option>
                      <option value="educator">Educator</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                    Login
                  </button>
                </form>

                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Wrap GoogleLogin in ErrorBoundary */}
                <ErrorBoundary>
                  <div className="d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        console.log("Google login success:", credentialResponse);
                        google_login(credentialResponse.credential);
                      }}
                      onError={() => {
                        console.error("Google login failed");
                        setMessage("Google login failed. Please try again.");
                      }}
                    />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;