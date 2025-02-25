import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const Students = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Alice Smith",
      email: "alice@example.com",
      class: "Class A",
    },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", class: "Class B" },
  ]);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");

  const handleAddStudent = () => {
    const newId = students.length + 1;
    const newStudent = {
      id: newId,
      name: newStudentName,
      email: newStudentEmail,
      class: newStudentClass,
    };
    setStudents([...students, newStudent]);
    // Clear fields
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentClass("");
  };

  const handleRemove = (id) => {
    const filtered = students.filter((s) => s.id !== id);
    setStudents(filtered);
  };

  return (
    <div>
      <h2>Manage Students</h2>

      {/* Form to Add Student */}
      <div className="card mb-3">
        <div className="card-header">Add New Student</div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Class</label>
            <input
              type="text"
              className="form-control"
              value={newStudentClass}
              onChange={(e) => setNewStudentClass(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddStudent}>
            Add Student
          </button>
        </div>
      </div>

      {/* List of Students */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Assigned Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.class}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => alert("Edit functionality not implemented!")}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(student.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                No students available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Students;
