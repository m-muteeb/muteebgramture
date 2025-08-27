import React, { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import img from '../../assets/images/new-logo.webp'; // Your logo image
import { FaHome, FaInfoCircle, FaComments } from 'react-icons/fa'; // Import FontAwesome icons
import { FaCaretDown, FaCaretRight } from 'react-icons/fa'; // Import FontAwesome icons for dropdown
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { fireStore } from '../../firebase/firebase'; // Firebase config
import "../../assets/css/topbar.css";

// Utility function to generate a slug from the topic name
const generateSlug = (str) => {
  return str
  .toLowerCase()
  .replace(/[^\w\s-]/g, '') // Remove non-word characters
  .replace(/\s+/g, '-') // Replace spaces with -
  .replace(/--+/g, '-') // Replace multiple - with single -
  .trim();
};

const Topbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownData, setDropdownData] = useState([]); // Store dropdown data
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar open/close state
  const [overlayVisible, setOverlayVisible] = useState(false); // Dark overlay visibility
  const [activeClassIndex, setActiveClassIndex] = useState(null); // Track which class is expanded
  const [activeSubCategoryIndex, setActiveSubCategoryIndex] = useState(null); // Track which subcategory is expanded

  const navigate = useNavigate();

  // Fetch data for dropdown using the provided logic
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        console.log('Fetching dropdown data from Firestore...');
        const q = query(collection(fireStore, 'topics'), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('No topics found in Firestore.');
        }

        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, subCategory, topic } = doc.data();
          if (!data[className]) {
            data[className] = [];
          }
          const subCategoryData = data[className].find((item) => item.subCategory === subCategory);
          if (subCategoryData) {
            subCategoryData.topics.push({ id: doc.id, topic, slug: generateSlug(topic) });
          } else {
            data[className].push({
              subCategory,
              topics: [{ id: doc.id, topic, slug: generateSlug(topic) }],
            });
          }
        });

        // Filter out categories that don't have topics or are empty
        const formattedData = Object.keys(data)
          .map((classKey) => ({
            title: classKey,
            content: data[classKey]
              .filter((category) => category.topics && category.topics.length > 0)
              .map((category) => ({
                subCategory: category.subCategory,
                topics: category.topics.filter((topic) => topic.topic.trim() !== ""),
              }))
              .filter((category) => category.topics.length > 0),
          }))
          .filter((dropdown) => dropdown.content.length > 0);

        setDropdownData(formattedData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Function to toggle the sidebar (open/close)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setOverlayVisible(!overlayVisible);
  };

  // Function to handle opening the search modal
  const handleSearch = () => {
    setIsModalVisible(true);
  };

  // Function to handle the OK button in the modal
  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  // Function to handle the Cancel button in the modal
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Function to handle changes in the search input field
  const handleSearchQuery = (e) => {
    setSearchQuery(e.target.value);
    // Here you can add a search filter to update searchResults based on query
  };

  // Function to handle navigating to a result page when a search item is clicked
  const handleNavigate = (link) => {
    navigate(link);
    setIsModalVisible(false); // Close modal after navigating
  };

  // Function to close the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setOverlayVisible(false);
  };

  // Function to toggle the visibility of the class's dropdown
  const toggleClassDropdown = (index) => {
    setActiveClassIndex(activeClassIndex === index ? null : index);
    setActiveSubCategoryIndex(null); // Reset subcategory when class is toggled
  };

  // Function to toggle the visibility of the subcategory's dropdown
  const toggleSubCategoryDropdown = (classIndex, subCategoryIndex) => {
    if (activeClassIndex === classIndex) {
      setActiveSubCategoryIndex(activeSubCategoryIndex === subCategoryIndex ? null : subCategoryIndex);
    }
  };

  return (
    <div
      className="topbar"
      style={{ zIndex: 15000, transition: "top 0.3s ease" ,  color: "#ffffff" }}
    >
      <div className="topbar-content">
        {/* Left: Hamburger Menu Button */}
        <div className="topbar-hamburger" onClick={toggleSidebar}>
          <i
            className="fas fa-bars"
            style={{
              color: '#ffffff',
              fontSize: '25px',
              border: '2px solid lightgray',
              borderRadius: '5px',
              padding: '5px',
              cursor: 'pointer',
            }}
          ></i>
        </div>

        {/* Left: Logo */}
        <div className="topbar-logo">
          <Link to="/Add Grammar">
            <img src={img} alt="Logo" />
          </Link>
        </div>

        {/* Center: Links */}
        <div className="topbar-links ">
          <Link to="/" className="topbar-link">
            <FaHome style={{ marginRight: '8px' }} />
            Home
          </Link>
          <Link to="/about" className="topbar-link about-link">
            <FaInfoCircle style={{ marginRight: '8px' }} />
            About Us
          </Link>
          <Link to="/discussion_forum" className="topbar-link">
            <FaComments style={{ marginRight: '8px' ,}} />
            Discussion Forum
          </Link>
        </div>

        {/* Right: Search Icon */}
        <div className="topbar-right">
          <button className="search-icon" onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      <Modal
        title="Search"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={null}
        centered
        className="search-modal"
      >
        <Input
          placeholder="Search for a topic"
          value={searchQuery}
          onChange={handleSearchQuery}
        />
        <div className="search-results">
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleNavigate(result.link)}>
                {result.label}
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${overlayVisible ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          className="sidebar-close-btn"
          onClick={closeSidebar}
        >
          &times;
        </button>

        {/* Display Classes and Subcategories */}
        <div className="class-list">
          <ul>
            {dropdownData.map((dropdown, index) => (
              <li key={index}>
                <div
                  className="class-item"
                  onClick={() => toggleClassDropdown(index)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeClassIndex === index ? 'bold' : 'normal',
                    color: 'black', // Color for class level
                  }}
                >
                  {activeClassIndex === index ? <FaCaretDown /> : <FaCaretRight />}
                  {dropdown.title}
                </div>

                {/* Show subcategories if the class is expanded */}
                {activeClassIndex === index && (
                  <ul style={{ paddingLeft: '20px' }}>
                    {dropdown.content.map((category, subIndex) => (
                      <li key={subIndex}>
                        <div
                          className="sub-category-item"
                          onClick={() => toggleSubCategoryDropdown(index, subIndex)}
                          style={{
                            cursor: 'pointer',
                            fontWeight: activeSubCategoryIndex === subIndex ? 'bold' : 'normal',
                            color: 'green', // Color for subcategory level
                          }}
                        >
                          {activeSubCategoryIndex === subIndex ? <FaCaretDown /> : <FaCaretRight />}
                          {category.subCategory}
                        </div>

                        {/* Show topics if the subcategory is expanded */}
                        {activeSubCategoryIndex === subIndex && (
                          <ul style={{ paddingLeft: '20px' }}>
                            {category.topics.map((topic, tIdx) => (
                              <li key={tIdx}>
                                <Link
                                  to={`/description/${category.subCategory}/${topic.slug}`} 
                                  className="topic-link" 
                                  style={{ color: 'blue' }}
                                >
                                  {topic.topic}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
