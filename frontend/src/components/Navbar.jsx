import { Link } from "react-router-dom";
import "../App"; // Import the CSS

const Navbar = () => {
  // Replace with actual authentication logic
  const student = false; // This should be fetched from your authentication state

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
        <span className="navbar-title">VIRTUAL SCHOOL</span>
      </Link>

      <ul className="navbar-links">
        {student ? (
          <>
            <li><Link to="/logout">Logout</Link></li>
            <li><Link to="/Exam">Exam</Link></li>
            <li><Link to="/GradeSummary">Grades</Link></li>
            <li><Link to="/Chat">Chat</Link></li>
            <li><Link to="/StudyMaterial">Study Material</Link></li>   
            <li><Link to="/Profile">Profile</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
