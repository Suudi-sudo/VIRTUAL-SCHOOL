import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolContext } from '../../context/SchoolContext';
import { signup } from '../../services/authService';
import './Auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [schoolId, setSchoolId] = useState('');
  const { schools } = useContext(SchoolContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signup({ email, password, role, schoolId });
      if (user.role === 'teacher') navigate('/dashboard/teacher');
      else if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'owner') navigate('/dashboard/owner');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" 
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" 
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="owner">Owner</option>
          </select>
          {(role === 'teacher' || role === 'student') && (
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
              <option value="">Select School</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          )}
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
