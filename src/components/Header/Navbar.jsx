import React, { useState, useEffect, useRef } from "react";
import { Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { fireStore } from "../../firebase/firebase";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/css/navbar.css";

// Helper function to create slugs for URLs
const createSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [classes, setClasses] = useState([]);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Initialize as false
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const dropdownRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Set initial screen size
    setIsSmallScreen(window.innerWidth < 992);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      const isSmall = window.innerWidth < 992;
      setIsSmallScreen(isSmall);
      if (isSmall) setOpenDropdown(null);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const staticClasses = [
    "Moral Stories",
    "Applications",
    "Letters",
    "Applied Grammar",
    "Past Papers",
    "Translation",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchClassesAndTopics = async () => {
      try {
        const q = query(collection(fireStore, "topics"), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, subCategory, topic } = doc.data();
          if (staticClasses.includes(className)) {
            if (!data[className]) data[className] = [];
            data[className].push({ 
              id: doc.id, 
              subCategory, 
              topic,
              slug: createSlug(topic)
            });
          }
        });

        const formattedData = Object.keys(data).map((classKey) => ({
          class: classKey,
          topics: Array.from(
            new Map(data[classKey].map((item) => [item.topic, item])).values()
          )
        }));

        setClasses(formattedData);
      } catch (error) {
        console.error("Error fetching classes and topics:", error);
      }
    };

    fetchClassesAndTopics();
  }, [staticClasses]);

  const scrollNav = (direction) => {
    if (!isSmallScreen) {
      const newIndex = direction === "left" 
        ? Math.max(0, visibleStartIndex - 1) 
        : Math.min(classes.length - 1, visibleStartIndex + 1);
      setVisibleStartIndex(newIndex);
    }
  };

  const handleSubCategoryClick = () => {
    if (isSmallScreen) {
      setIsNavbarOpen(false);
      setOpenDropdown(null);
    }
  };

  const toggleDropdown = (index) => {
    if (isSmallScreen) {
      setOpenDropdown(openDropdown === index ? null : index);
    } else {
      setOpenDropdown(index);
    }
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg custom-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="container-fluid">
          <button
            className="navbar-toggler order-1"
            type="button"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            aria-controls="navbarNav"
            aria-expanded={isNavbarOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link to="/" className="navbar-brand order-2 ms-2">
            {/* Your Logo */}
          </Link>

          {!isSmallScreen && (
            <FaAngleLeft
              className={`nav-arrow left-arrow order-3 ${visibleStartIndex === 0 ? "disabled" : ""}`}
              onClick={() => scrollNav("left")}
            />
          )}

          <div
            className={`collapse navbar-collapse justify-content-center order-4 ${isNavbarOpen ? "show" : ""}`}
            id="navbarNav"
          >
            <ul className="navbar-nav d-flex justify-content-center w-100" ref={dropdownRef}>
              {staticClasses.map((className, index) => (
                <li
                  key={index}
                  className="nav-item dropdown position-relative mx-2"
                  onMouseEnter={!isSmallScreen ? () => toggleDropdown(index) : undefined}
                  onMouseLeave={!isSmallScreen ? () => setOpenDropdown(null) : undefined}
                >
                  <div
                    className="nav-link dropdown-toggle"
                    style={{ cursor: "pointer", wordWrap: "break-word" }}
                    onClick={isSmallScreen ? () => toggleDropdown(index) : undefined}
                  >
                    {className}
                  </div>
                  <Collapse in={openDropdown === index}>
                    <div className="dropdown-menu mt-0 shadow p-3 bg-light border custom-dropdown-width">
                      <ul className="list-unstyled ms-3 mt-2">
                        {classes
                          .filter((classData) => classData.class === className)
                          .map((classData) =>
                            classData.topics.map((topic, topicIndex) => (
                              <li key={`${className}-${topicIndex}`} className="py-0.5">
                                <Link
                                  to={`/description/${topic.subCategory}/${topic.slug}`}
                                  className="sub-category-link"
                                  onClick={handleSubCategoryClick}
                                  style={{
                                    textDecoration: "none",
                                    color: "#dc3545",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {`${topicIndex + 1}. ${topic.topic}`}
                                </Link>
                              </li>
                            ))
                          )}
                      </ul>
                    </div>
                  </Collapse>
                </li>
              ))}

              {classes
                .filter((classData) => !staticClasses.includes(classData.class))
                .map((classData, index) => (
                  <li
                    key={`dynamic-${index}`}
                    className="nav-item dropdown position-relative mx-2"
                    onMouseEnter={!isSmallScreen ? () => toggleDropdown(index) : undefined}
                    onMouseLeave={!isSmallScreen ? () => setOpenDropdown(null) : undefined}
                  >
                    <div
                      className="nav-link dropdown-toggle"
                      style={{ cursor: "pointer", wordWrap: "break-word" }}
                      onClick={isSmallScreen ? () => toggleDropdown(index) : undefined}
                    >
                      {classData.class}
                    </div>
                    <Collapse in={openDropdown === index}>
                      <div className="dropdown-menu mt-0 shadow p-3 bg-light border custom-dropdown-width">
                        <ul className="list-unstyled ms-3 mt-2">
                          {classData.topics.map((topic, topicIndex) => (
                            <li key={`${classData.class}-${topicIndex}`} className="py-0.5">
                              <Link
                                to={`/description/${topic.subCategory}/${topic.slug}`}
                                className="sub-category-link"
                                onClick={handleSubCategoryClick}
                                style={{
                                  textDecoration: "none",
                                  color: "#007bff",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {`${topicIndex + 1}. ${topic.topic}`}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Collapse>
                  </li>
                ))}
            </ul>
          </div>

          {!isSmallScreen && (
            <FaAngleRight
              className={`nav-arrow right-arrow order-5 ${visibleStartIndex + 6 >= classes.length ? "disabled" : ""}`}
              onClick={() => scrollNav("right")}
            />
          )}
        </div>
      </nav>

      {/* News Bar */}
      <div className="news-bar">
        <div className="scrolling-news">
          <span>🎉 New Syllabus 2025 Released – Be the First to Explore!</span>
          <span>✨ Explore New Features!</span>
          <span>🏆 Solve Tests & Get a FREE Certificate!</span>
          <span>🛠️ UI Improvements for Mobile Devices!</span>
        </div>
      </div>
    </>
  );
};

export default Navbar;