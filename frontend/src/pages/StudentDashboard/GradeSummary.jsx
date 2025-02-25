import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GradeSummary = () => {
  const [examGrades, setExamGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamGrades = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/student/exam-grades');
        setExamGrades(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exam grades:', error);
        setError('Failed to load exam grades. Please try again later.');
        setLoading(false);
      }
    };

    fetchExamGrades();
  }, []);

  if (loading) return <div>Loading exam grades...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="grade-summary">
      <h2>Exam Grade Summary</h2>
      {examGrades.length === 0 ? (
        <p>No exam grades available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Exam Title</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {examGrades.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.score}/{exam.totalPoints}</td>
                <td>{exam.grade}</td>
                <td>{new Date(exam.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GradeSummary;