import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";

const GradeSummary = () => {
  const [examGrades, setExamGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamGrades = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/student/exam-grades');

        // Ensure the response is an array
        const grades = Array.isArray(response.data) ? response.data : [];
        setExamGrades(grades);
      } catch (err) {
        console.error('Error fetching exam grades:', err);
        setError('Failed to load exam grades. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExamGrades();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h3>Exam Grade Summary</h3>
        </div>
        <div className="card-body">
          {loading && <div className="alert alert-info text-center">Loading exam grades...</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {!loading && !error && (
            examGrades.length === 0 ? (
              <div className="alert alert-warning text-center">No exam grades available.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Exam Title</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examGrades.map((exam, index) => (
                      <tr key={exam.id || index}>
                        <td>{exam.title || 'N/A'}</td>
                        <td>{exam.score}/{exam.totalPoints}</td>
                        <td>
                          <span className={`badge ${
                            exam.grade === 'A' ? 'bg-success' :
                            exam.grade === 'B' ? 'bg-primary' :
                            exam.grade === 'C' ? 'bg-warning' :
                            'bg-danger'}`}>
                            {exam.grade || 'N/A'}
                          </span>
                        </td>
                        <td>{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeSummary;
