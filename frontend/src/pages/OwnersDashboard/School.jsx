import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const BASE_URL = "http://localhost:5000";

const School = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch schools");
      }
      const data = await resp.json();
      setSchools(data.schools || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/schools/${schoolId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        throw new Error("Unable to delete school");
      }
      // Remove from local state
      setSchools((prev) => prev.filter((s) => s.id !== schoolId));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Manage Schools</h2>
          <Link to="/createschool" className="btn btn-primary">
            Create New School
          </Link>
        </div>

        {loading && <p>Loading schools...</p>}
        {error && <p className="text-danger">{error}</p>}

        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>School Name</th>
              <th>Created By (User ID)</th>
              <th>Created At</th>
              <th style={{ width: "180px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && schools.length === 0 && (
              <tr>
                <td colSpan={4}>No schools available</td>
              </tr>
            )}
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{school.created_by}</td>
                <td>{new Date(school.created_at).toLocaleString()}</td>
                <td>
                  {/* New "View" button linking to /schools/:id */}
                  <Link
                    to={`/schools/${school.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    View
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(school.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default School;
