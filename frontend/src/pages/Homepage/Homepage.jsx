import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isProgramsDropdownOpen, setIsProgramsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Navigate to the search results page (if implemented)
    navigate(`/search?query=${searchQuery}`);
  };

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-links">
          {/* About Us Dropdown */}
          <div className="dropdown">
            <button className="about-btn" onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}>
              About Us ▼
            </button>
            {isAboutDropdownOpen && (
              <div className="dropdown-content">
                <p>📘 We provide world-class virtual education.</p>
                <p>🎓 Trusted by thousands of students worldwide.</p>
                <p>🌎 Connecting students and educators globally.</p>
                <button onClick={() => navigate('/about')}>Learn More</button>
              </div>
            )}
          </div>

          {/* Our Programs Dropdown */}
          <div className="dropdown">
            <button className="programs-btn" onClick={() => setIsProgramsDropdownOpen(!isProgramsDropdownOpen)}>
              Our Programs ▼
            </button>
            {isProgramsDropdownOpen && (
              <div className="dropdown-content">
                <p>🎓 Our programs cover a wide range of subjects, including Science, Mathematics, Computer Science, Business, and Languages. We aim to provide flexible, high-quality virtual learning for students worldwide.</p>
              </div>
            )}
          </div>

          {/* Find Your School - Shows Search Bar */}
          <div className="dropdown">
            <button className="search-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              Find Your School ▼
            </button>
            {isSearchOpen && (
              <div className="dropdown-content search-dropdown">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search for a school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-submit">Search</button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="auth-buttons">
          <button className="signup-btn" onClick={() => navigate('/Signup')}>SIGN UP</button>
          <button className="login-btn" onClick={() => navigate('/Login')}>LOGIN</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Welcome to Virtual Schools</h1>
        <p>
  ONLINE LEARNING is simplified in every possible way by Virtual Schools.  
  Our platform provides a seamless and interactive learning experience,  
  allowing students to connect with top educators, access high-quality  
  educational materials, and participate in engaging virtual classrooms.  
  Whether you're looking for flexible scheduling, personalized learning,  
  or a safe and comfortable learning environment, our virtual school  
  system is designed to meet the needs of students worldwide.  
  Explore a wide range of programs, interact with a vibrant learning  
  community, and take control of your educational journey—all from the  
  comfort of your home.
</p>

        <p>Find any school that offers your desired courses.</p>
        <p className="highlight">
          GET A SNEAK PEEK OF WHAT ONLINE LEARNING REALLY LOOKS LIKE
        </p>
        <p>The decision to switch to online school is a big one—and we’re here to help you decide what’s right for your family.</p>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          ✅ <strong>Engaging Virtual Classrooms</strong> – Live interactive sessions with educators and classmates, collaborative discussions, and personalized learning experiences.
        </div>
        <div className="feature-card">
          ✅ <strong>Flexible Learning</strong> – Students can learn at their own pace with access to high-quality resources anytime, anywhere.
        </div>
        <div className="feature-card">
          ✅ <strong>Comprehensive Support</strong> – Dedicated teachers, mentors, and academic advisors to guide students every step of the way.
        </div>
        <div className="feature-card">
          ✅ <strong>A Safe and Comfortable Environment</strong> – Learn from home while staying connected with a vibrant online school community.
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Virtual Schools is one of the world’s leading learning companies.</p>
        <p>509 S Exeter St., Suite 202, Baltimore, MD 21202</p>
        <p>1-833-591-0251</p>
        <div className="social-icons">
          <span></span> <span>📷</span> <span>📘</span>
        </div>
        <div className="footer-links">
          <button onClick={() => navigate('/privacy')}>Privacy</button> | 
          <button onClick={() => navigate('/terms')}>Terms of Use</button> | 
          <button onClick={() => navigate('/accessibility')}>Accessibility</button>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
