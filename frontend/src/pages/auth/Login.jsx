import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginService({ email, password });
      // Redirect based on role
      if (user.role === 'teacher') navigate('/dashboard/teacher');
      else if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'owner') navigate('/dashboard/owner');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google Login Clicked"); // Replace with actual Google authentication logic
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
      
      <div className="google-login" onClick={handleGoogleLogin}>
        <img src="/google-logo.png" alt="Google Logo" className="google-logo" />
        Continue with Google
      </div>
    </div>
  );
};

export default Login;
