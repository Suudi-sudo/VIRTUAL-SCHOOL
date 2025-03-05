import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const BASE_URL = "http://localhost:5000";

const School = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // === NEW STATES FOR CREATING A CLASS IN A SELECTED SCHOOL ===
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [classFormData, setClassFormData] = useState({
    name: "",
    educator_id: "",
  });

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

  // DELETE SCHOOL
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

  // === CREATE CLASS HANDLERS ===
  const openCreateClassModal = (schoolId) => {
    setSelectedSchoolId(schoolId);
    setClassFormData({ name: "", educator_id: "" });
    setShowClassModal(true);
  };

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/schools/${selectedSchoolId}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classFormData),
      });
      if (!resp.ok) {
        // Attempt to parse the server’s error message
        const errData = await resp.json();
        throw new Error(errData.msg || "Failed to create class");
      }
      const data = await resp.json();
      alert(data.msg || "Class created successfully!");

      setShowClassModal(false);
      // Optionally: navigate somewhere else or fetch something to see changes
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
              <th>Created At</th>
              <th style={{ width: "280px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && schools.length === 0 && (
              <tr>
                <td colSpan={3}>No schools available</td>
              </tr>
            )}
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{new Date(school.created_at).toLocaleString()}</td>
                <td>
                  {/* VIEW */}
                  <Link
                    to={`/schools/${school.id}`}
                    className="btn btn-success btn-sm me-2"
                  >
                    View
                  </Link>

                  {/* DELETE */}
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleDelete(school.id)}
                  >
                    Delete
                  </button>

                  {/* CREATE CLASS */}
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => openCreateClassModal(school.id)}
                  >
                    Create Class
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL FOR CREATING A CLASS */}
        {showClassModal && (
          <>
            {/* Background overlay */}
            <div className="modal-backdrop fade show" />

            <div
              className="modal fade show"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <form className="modal-content" onSubmit={handleCreateClass}>
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Class</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowClassModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Class Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={classFormData.name}
                        onChange={handleClassFormChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="educator_id" className="form-label">
                        Educator ID
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="educator_id"
                        value={classFormData.educator_id}
                        onChange={handleClassFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowClassModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create Class
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default School;
