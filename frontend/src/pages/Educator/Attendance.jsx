import React, { useState, useEffect, useCallback } from "react";

function MainComponent() {
  const [attendanceData, setAttendanceData] = useState({
    attendance: [],
    total: 0,
    pages: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const defaultFormData = {
    class_id: "",
    student_id: "",
    status: "present",
    signed_by: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchAttendance = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`/attendance?page=${page}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      setError("Failed to load attendance records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(currentPage);
  }, [currentPage, fetchAttendance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/attendance", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create attendance");
      }

      setSuccess("Attendance recorded successfully");
      setFormData(defaultFormData);
      fetchAttendance(currentPage);
    } catch (err) {
      setError("Failed to record attendance");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/attendance/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete attendance");
      }

      setSuccess("Attendance deleted successfully");
      fetchAttendance(currentPage);
    } catch (err) {
      setError("Failed to delete attendance");
      console.error(err);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      setSuccess("Attendance updated successfully");
      setEditingId(null);
      fetchAttendance(currentPage);
    } catch (err) {
      setError("Failed to update attendance");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5 ">
      <h1 className="text-center mb-4">Attendance Management</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Class ID"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Student ID"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Signed By"
              value={formData.signed_by}
              onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-dark mt-3">Mark Attendance</button>
      </form>

      <table className="table table-dark table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Class ID</th>
            <th>Student ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Signed By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.attendance.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.class_id}</td>
              <td>{record.student_id}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td className={record.status === "present" ? "text-success" : "text-danger"}>{record.status}</td>
              <td>{record.signed_by}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => setEditingId(record.id)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MainComponent;
