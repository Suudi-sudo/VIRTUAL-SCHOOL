import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const BASE_URL = "http://localhost:5000";

const Students = () => {
  // Form states for adding a new student
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Feedback / error states
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // List of students
  const [students, setStudents] = useState([]);

  // For updating a student
  const [editStudent, setEditStudent] = useState(null); // the student being edited
  const [editForm, setEditForm] = useState({ username: "", email: "" }); // modal form values

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Retrieve students from the server
  const fetchStudents = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/users?role=student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await resp.json();
      setStudents(data.users || []);
    } catch (err) {
      console.error(err);
      setError("Could not fetch students. Make sure you’re logged in and have a valid token.");
    }
  };

  // Add a new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if your backend requires a token for creation
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "student",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.msg || "Failed to add student");
      }
      setFeedback("Student added successfully!");
      setUsername("");
      setEmail("");
      setPassword("");
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------------------------
  // UPDATE STUDENT (MODAL LOGIC)
  // ---------------------------
  const handleOpenEditModal = (student) => {
    setEditStudent(student);
    setEditForm({
      username: student.username,
      email: student.email,
    });
  };

  const handleCloseEditModal = () => {
    setEditStudent(null);
    setEditForm({ username: "", email: "" });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEditStudent = async (e) => {
    e.preventDefault();
    if (!editStudent) return;

    try {
      setError("");
      setFeedback("");
      const token = localStorage.getItem("token");

      // NOTE the updated route: /users/:id/update
      const resp = await fetch(`${BASE_URL}/users/${editStudent.id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Send only the fields you allow to update
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.msg || "Failed to update student");
      }
      setFeedback("Student updated successfully!");

      // Close the modal
      handleCloseEditModal();

      // Refresh the list
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------------------------
  // ADD STUDENT TO A SCHOOL
  // ---------------------------
  const handleAddToSchool = async (studentId) => {
    try {
      setError("");
      setFeedback("");
      const schoolId = prompt("Enter the School ID to add the student to:");
      if (!schoolId) return; // user cancelled or left it blank

      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/schools/${schoolId}/add-student`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: studentId }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.msg || "Failed to add student to school");
      }
      setFeedback("Student added to school successfully!");
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
        <h2 className="mb-4">Manage Students</h2>

        {/* Error/Feedback messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {feedback && <div className="alert alert-success">{feedback}</div>}

        {/* Add Student Form */}
        <div
          className="card border-0 shadow mb-4"
          style={{ maxWidth: "400px", backgroundColor: "#002b5c" }}
        >
          <div className="card-header" style={{ backgroundColor: "#003366", color: "#fff" }}>
            <h5 className="mb-0">Add New Student</h5>
          </div>
          <div className="card-body" style={{ color: "#fff" }}>
            <form onSubmit={handleAddStudent}>
              <div className="mb-3">
                <label className="form-label">Student Username</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="AliceWonder"
                  style={{ backgroundColor: "#001f3f", color: "#fff" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Student Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@example.com"
                  style={{ backgroundColor: "#001f3f", color: "#fff" }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Student Password</label>
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
                Add Student
              </button>
            </form>
          </div>
        </div>

        {/* Students List (Navy Themed) */}
        <div
          className="card border-0 shadow"
          style={{ backgroundColor: "#002b5c" }}
        >
          <div
            className="card-header"
            style={{ backgroundColor: "#001f3f", color: "#fff" }}
          >
            <h5 className="mb-0">Students List</h5>
          </div>
          <div className="card-body" style={{ backgroundColor: "#001f3f", color: "#fff" }}>
            {students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle" style={{ color: "#fff" }}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th style={{ width: "30%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.username}</td>
                        <td>{student.email}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-light me-2"
                              onClick={() => handleOpenEditModal(student)}
                            >
                              Update
                            </button>
                            {/* Remove delete button */}
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => handleAddToSchool(student.id)}
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

        {/* EDIT STUDENT MODAL */}
        {editStudent && (
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
                  <h5 className="modal-title">Edit Student</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseEditModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ backgroundColor: "#002b5c", color: "#fff" }}>
                  <form onSubmit={submitEditStudent}>
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
        {/* END EDIT STUDENT MODAL */}
      </div>
    </div>
  );
};

export default Students;
