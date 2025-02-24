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

      </ul>
    </nav>
  );
};

export default Navbar;
