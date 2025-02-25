import React, { useState } from "react";
import { Link } from "react-router-dom";

const School = () => {
  // Example of local state for schools
  const [schools, setSchools] = useState([
    {
      id: 1,
      name: "School A",
      description: "Primary school",
      classesCount: 5,
    },
    {
      id: 2,
      name: "School B",
      description: "High school",
      classesCount: 10,
    },
  ]);

  const handleDelete = (id) => {
    const filtered = schools.filter((school) => school.id !== id);
    setSchools(filtered);
  };

  return (
    <div>
      <h2>Manage Schools</h2>
      <div className="mb-3">
        <Link to="/create-school" className="btn btn-success">
          Create New School
        </Link>
      </div>

      {/* List of Schools */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Number of Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{school.description}</td>
                <td>{school.classesCount}</td>
                <td>
                  {/* Edit, View Classes, Add Educators/Students, Delete */}
                  <button className="btn btn-primary btn-sm me-2">Edit</button>
                  <button className="btn btn-info btn-sm me-2">
                    View Classes
                  </button>
                  <button className="btn btn-warning btn-sm me-2">
                    Add Users
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(school.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  No schools available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default School;
