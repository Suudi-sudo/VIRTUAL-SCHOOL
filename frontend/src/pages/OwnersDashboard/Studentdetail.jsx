import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

const BASE_URL = "http://localhost:5000";

const SchoolDetail = () => {
  const { schoolId } = useParams(); // get the :schoolId param from URL
  const [school, setSchool] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch a single school's details, plus any teachers/students
  const fetchSchoolDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      // Endpoint expected to return: { school: {...}, teachers: [...], students: [...] }
      const resp = await fetch(`${BASE_URL}/schools/${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // must include the token for a protected route
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch school details");
      }
      const data = await resp.json();

      // Update state with the returned data
      setSchool(data.school);
      setTeachers(data.teachers || []);
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch school details once on mount (and whenever schoolId changes)
  useEffect(() => {
    fetchSchoolDetails();
  }, [schoolId]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="flex-grow-1 p-4 bg-light">
        <h2>School Detail</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {school && (
          <div>
            <h4>{school.name}</h4>
            <p>Created By: {school.created_by}</p>
            <p>Created At: {new Date(school.created_at).toLocaleString()}</p>
          </div>
        )}

        <hr />

        {/* Teachers Table */}
        <h5>Teachers in this school</h5>
        {teachers.length === 0 ? (
          <p>No teachers found for this school.</p>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.username}</td>
                  <td>{t.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <hr />

        {/* Students Table */}
        <h5>Students in this school</h5>
        {students.length === 0 ? (
          <p>No students found for this school.</p>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.username}</td>
                  <td>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;
