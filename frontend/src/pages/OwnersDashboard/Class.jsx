import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';

function ClassPage() {
  // Grab the URL param named "schoolId"
  const { schoolId } = useParams();

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', educator_id: '' });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    // If no schoolId in the URL, show error and skip fetching
    if (!schoolId) {
      setError('No valid school ID provided.');
      return;
    }

    // Pass school_id as a query param so the Flask code does the filtering
    fetch(`${BASE_URL}/classes?school_id=${schoolId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        return response.json();
      })
      .then((data) => {
        setClasses(data); // The server already filters by school_id
      })
      .catch((err) => setError(err.message));
  }, [schoolId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!schoolId) {
      setError('No valid school ID provided.');
      return;
    }

    const classData = { ...newClass, school_id: schoolId };

    fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    })
      .then((response) => {
        if (!response.ok) {
          // If server returns an error JSON, parse it
          return response.json().then((err) => {
            throw new Error(err.error || 'Failed to create class');
          });
        }
        return response.json();
      })
      .then((data) => {
        // Only add if the new class matches the current URL's schoolId
        if (data.school_id.toString() === schoolId.toString()) {
          setClasses((prev) => [...prev, data]);
        }
        setNewClass({ name: '', educator_id: '' });
        setShowModal(false);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#1B1F3B' }}>
      <Sidebar />

      <div className="container-fluid text-white py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Classes</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!schoolId}
          >
            Create Class
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <h2 className="mb-3">Existing Classes</h2>
        <table className="table table-bordered table-dark table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Class Name</th>
              <th>Educator ID</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.id}</td>
                  <td>{cls.name}</td>
                  <td>{cls.educator_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No classes available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showModal && (
          <>
            <div className="modal-backdrop fade show" />
            <div
              className="modal fade show"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              style={{ display: 'block' }}
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <form className="modal-content text-dark" onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Class</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setShowModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Class Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={newClass.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="educator_id" className="form-label">
                        Teacher (Educator ID)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="educator_id"
                        name="educator_id"
                        value={newClass.educator_id}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!schoolId}
                    >
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
}

export default ClassPage;
