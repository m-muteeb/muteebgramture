import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegBell, FaBars, FaTimes } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import "../assets/css/header.css";
import logo from "../assets/images/navbarlogo.webp";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false); // desktop dropdown
  const [showMobileDropdown, setShowMobileDropdown] = useState(false); // mobile dropdown
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setShowMobileDropdown(false); // Close mobile dropdown on link click
  };

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="container">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <Link to="/" className="site-name" onClick={handleLinkClick}>
            Gramture
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>

          {/* Sections Dropdown (Desktop) */}
          <div
            className="dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            ref={dropdownRef}
          >
            <span className="dropdown-title">Sections</span>
            {showDropdown && (
             // Inside dropdown-content in Header.js
<div className="dropdown-content">
  <Link to="/sections/Applications">Applications</Link>
  <Link to="/sections/Letters">Letters</Link>
  <Link to="/sections/Translation">Translation</Link>
  <Link to="/sections/Grammar">Grammar</Link>
  <Link to="/sections/Idioms">Idioms</Link>
  <Link to="/sections/Direct & Indirect">Direct & Indirect</Link>
</div>

            )}
          </div>

          <Link to="/contact">Contact Us</Link>
        </nav>

        {/* Right Section */}
        <div className="right-section">
         
            <Link to="/gramturestore">
              <button className="sign-in-btn">Gramture Store</button>
            </Link>
          
        </div>

        {/* Mobile Toggle Button */}
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={handleLinkClick}>Home</Link>
          <Link to="/about" onClick={handleLinkClick}>About Us</Link>

          {/* Sections Dropdown (Mobile) */}
          <div className="mobile-dropdown">
            <span
              className="dropdown-title"
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
            >
              Sections
            </span>
            {showMobileDropdown && (
              <div className="dropdown-content">
  <Link to="/sections/Applications" onClick={handleLinkClick}>Applications</Link>
  <Link to="/sections/Letters" onClick={handleLinkClick}>Letters</Link>
  <Link to="/sections/Translation" onClick={handleLinkClick}>Translation</Link>
  <Link to="/sections/Grammar" onClick={handleLinkClick}>Grammar</Link>
  <Link to="/sections/Idioms" onClick={handleLinkClick}>Idioms</Link>
  <Link to="/sections/Direct & Indirect" onClick={handleLinkClick}>Direct & Indirect</Link>
  <Link to="/sections/Others" onClick={handleLinkClick}>More...</Link>
</div>

            )}
          </div>

          <Link to="/contact" onClick={handleLinkClick}>Contact Us</Link>

                    <Link to="/gramturestore">
              <button className="sign-in-btn">Gramture Store</button>
            </Link>
        </div>
      )}
    </header>
  );
}











