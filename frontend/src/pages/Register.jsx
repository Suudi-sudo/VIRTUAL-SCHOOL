import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css";

// Create UserContext
export const UserContext = createContext();

const Register = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ Hook for redirection

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    try {
      const response = await fetch("https://virtual-school-2.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem("admin", JSON.stringify(data)); // ✅ Save user to localStorage
        setMessage("Registration successful! Redirecting to login...");

        // ✅ Redirect to login after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage(data.msg);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    window.location.href = "https://virtual-school-2.onrender.com/authorize_google";
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
                <h5 className="modal-title">Create an Account</h5>
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
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="Enter your username"
                    />
                  </div>

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

                  {/* <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select form-select-lg"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Educator</option>
                      <option value="admin">Owner</option>
                    </select>
                  </div> */}

                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                    Register Now 🚀
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
    </UserContext.Provider>
  );
};

export default Register;