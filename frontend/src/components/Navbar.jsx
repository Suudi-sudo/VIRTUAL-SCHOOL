import { Link } from "react-router-dom";
import "../App"; // Import the CSS

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
        <span className="navbar-title">VIRTUAL SCHOOL</span>
      </Link>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        
         
      </ul>
    </nav>
  );
};

export default Navbar;