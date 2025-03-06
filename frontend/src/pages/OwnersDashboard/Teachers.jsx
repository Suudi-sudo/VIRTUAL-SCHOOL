import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const BASE_URL = "https://virtual-school-2.onrender.com";

const Teachers = () => {
  // Form states for adding a new teacher
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Feedback / error states
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // List of teachers
  const [teachers, setTeachers] = useState([]);

  // For updating a teacher
  const [editTeacher, setEditTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "" });

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Retrieve teachers from the server
  const fetchTeachers = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/users?role=educator`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await resp.json();
      setTeachers(data.users || []);
    } catch (err) {
      console.error(err);
      setError("Could not fetch teachers. Make sure you’re logged in and have a valid token.");
    }
  };

  // Add a new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    try {
      const resp = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "educator", // role is educator in the DB
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.msg || "Failed to add teacher");
      }
      setFeedback("Teacher added successfully!");
      setUsername("");
      setEmail("");
      setPassword("");
      fetchTeachers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (teacher) => {
    setEditTeacher(teacher);
    setEditForm({
      username: teacher.username,
      email: teacher.email,
    });
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditTeacher(null);
    setEditForm({ username: "", email: "" });
  };

  // Handle changes in edit modal form
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Submit update teacher
  const submitEditTeacher = async (e) => {
    e.preventDefault();
    if (!editTeacher) return;

    try {
      setError("");
      setFeedback("");
      const token = localStorage.getItem("token");

      const resp = await fetch(`${BASE_URL}/users/${editTeacher.id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.msg || "Failed to update teacher");
      }
      setFeedback("Teacher updated successfully!");
      handleCloseEditModal();
      fetchTeachers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Add teacher to a school (calls /schools/:schoolId/add-educator)
  const handleAddToSchool = async (teacherId) => {
    try {
      setError("");
      setFeedback("");
      const schoolId = prompt("Enter the School ID to add the teacher to:");
      if (!schoolId) return;

      const token = localStorage.getItem("token");
      // Notice the endpoint and body: { teacher_id: teacherId }
      const resp = await fetch(`${BASE_URL}/schools/${schoolId}/add-educator`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.msg || "Failed to add teacher to school");
      }
      setFeedback("Teacher added to school successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      {/* Entire page in navy blue theme */}
      <div
        className="flex-grow-1 p-4 text-white"
        style={{ backgroundColor: "#001f3f" }} // navy background
      >
        <h2 className="mb-4">Manage Teachers</h2>

        {/* Error/Feedback messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {feedback && <div className="alert alert-success">{feedback}</div>}

        {/* Add Teacher Form */}
        <div
          className="card border-0 shadow mb-4"
          style={{ maxWidth: "400px", backgroundColor: "#002b5c" }}
        >
          <div className="card-header" style={{ backgroundColor: "#003366", color: "#fff" }}>
            <h5 className="mb-0">Add New Teacher</h5>
          </div>
          <div className="card-body" style={{ color: "#fff" }}>
            <form onSubmit={handleAddTeacher}>
              <div className="mb-3">
                <label className="form-label">Teacher Username</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JohnDoe"
                  style={{ backgroundColor: "#001f3f", color: "#fff" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teacher Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{ backgroundColor: "#001f3f", color: "#fff" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teacher Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={{ backgroundColor: "#001f3f", color: "#fff" }}
                />
              </div>
              <button className="btn btn-primary w-100" type="submit">
                Add Teacher
              </button>
            </form>
          </div>
        </div>

        {/* Teachers List (Navy Themed) */}
        <div
          className="card border-0 shadow"
          style={{ backgroundColor: "#002b5c" }}
        >
          <div
            className="card-header"
            style={{ backgroundColor: "#001f3f", color: "#fff" }}
          >
            <h5 className="mb-0">Teachers List</h5>
          </div>
          <div className="card-body" style={{ backgroundColor: "#001f3f", color: "#fff" }}>
            {teachers.length === 0 ? (
              <p>No teachers found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle" style={{ color: "#fff" }}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th style={{ width: "250px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>{teacher.username}</td>
                        <td>{teacher.email}</td>
                        <td>
                          {/* Button group to make them uniform */}
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => handleOpenEditModal(teacher)}
                            >
                              Update
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => handleAddToSchool(teacher.id)}
                            >
                              Add to School
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* EDIT TEACHER MODAL */}
        {editTeacher && (
          <div
            className="modal show"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog">
              <div className="modal-content border-0">
                <div
                  className="modal-header"
                  style={{ backgroundColor: "#003366", color: "#fff" }}
                >
                  <h5 className="modal-title">Edit Teacher</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseEditModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ backgroundColor: "#002b5c", color: "#fff" }}>
                  <form onSubmit={submitEditTeacher}>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={editForm.username}
                        onChange={handleEditFormChange}
                        style={{ backgroundColor: "#001f3f", color: "#fff" }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        style={{ backgroundColor: "#001f3f", color: "#fff" }}
                      />
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary me-2">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseEditModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* END EDIT TEACHER MODAL */}
      </div>
    </div>
  );
};

export default Teachers;
