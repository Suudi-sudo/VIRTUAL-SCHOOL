import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:5000/authorize_google";
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

                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                    Login
                  </button>
                </form>

                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-light btn-lg w-100 d-flex align-items-center justify-content-center"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="me-2"
                    style={{ width: "20px", height: "20px" }}
                  />
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;

