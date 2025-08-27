import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { FaBars, FaTimes } from 'react-icons/fa';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';

import '../assets/css/sidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownData, setDropdownData] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategory, setOpenCategory] = useState({});
  
  // Static classes to be displayed in sidebar
  const staticClasses = [
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'Moral Stories',
    'Applications',
    'Letters',
    'Applied Grammar',
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const q = query(collection(fireStore, 'topics'), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, subCategory, topic } = doc.data();
          if (!data[className]) {
            data[className] = [];
          }
          const subCategoryData = data[className].find((item) => item.subCategory === subCategory);
          if (subCategoryData) {
            subCategoryData.topics.push({ id: doc.id, topic });
          } else {
            data[className].push({
              subCategory,
              topics: [{ id: doc.id, topic }],
            });
          }
        });

        // Filter out categories that don't have topics or are empty
        const formattedData = Object.keys(data)
          .map((classKey) => ({
            title: classKey,
            content: data[classKey]
              .filter((category) => category.topics && category.topics.length > 0) // Remove empty categories
              .map((category) => ({
                subCategory: category.subCategory,
                topics: category.topics.filter((topic) => topic.topic.trim() !== ""), // Remove empty topics
              }))
              .filter((category) => category.topics.length > 0), // Remove categories without topics
          }))
          .filter((dropdown) => dropdown.content.length > 0); // Remove dropdowns with no valid categories

        setDropdownData(formattedData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const toggleCategory = (index, categoryIndex) => {
    const key = `${index}-${categoryIndex}`;
    setOpenCategory((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Combine static classes with dynamic data
  const combinedClasses = staticClasses.map((staticClass) => {
    const dynamicClassData = dropdownData.find((dropdown) => dropdown.title === staticClass);
    return {
      title: staticClass,
      content: dynamicClassData ? dynamicClassData.content : [],
    };
  });

  const filteredClasses = combinedClasses.filter((dropdown) =>
    dropdown.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="homepage d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'd-block' : 'd-none'} d-lg-block`}>
        {/* Collapse Button for Small Screens */}
        <div className="d-lg-none mb-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes className="icon" /> : <FaBars className="icon" />}
        </div>

        {/* Search Bar */}
       
        
        {/* Dropdown Content */}
        <div className="tags-list">
          {filteredClasses.map((dropdown, index) => (
            <div key={index} className="mb-1">
              {/* Class Dropdown */}
              <div
                className="d-flex justify-content-between align-items-center dropdown-header"
                onClick={() => toggleDropdown(index)}
                style={{
                  padding: '8px', 
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                <h6 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{dropdown.title}</h6>
                {openDropdown === index ? <BsChevronUp /> : <BsChevronDown />}
              </div>
              <Collapse in={openDropdown === index}>
                <div className="mt-1">
                  {/* SubCategory Dropdowns */}
                  <ul className="list-unstyled mt-1">
                    {dropdown.content.map((category, categoryIndex) => (
                      <li key={categoryIndex} className="py-0.5">
                        <div
                          className="d-flex justify-content-between align-items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(index, categoryIndex);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <h6 style={{ fontSize: '0.8rem', fontWeight: '500' }}>{category.subCategory}</h6>
                          {openCategory[`${index}-${categoryIndex}`] ? <BsChevronUp /> : <BsChevronDown />}
                        </div>
                        <Collapse in={openCategory[`${index}-${categoryIndex}`]}>
                          <ul className="list-unstyled mt-1 pl-3">
                            {category.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="py-0.5">
                                <Link
                                  to={`/description/${category.subCategory}/${topic.id}`}
                                  className="sub-category-link"
                                  onClick={handleLinkClick}
                                  style={{
                                    textDecoration: 'none',
                                    color: '#FF0000',
                                    fontSize: '0.8rem',
                                    fontWeight: '400',
                                    transition: 'color 0.2s ease',
                                  }}
                                >
                                  {topic.topic}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Collapse>
                      </li>
                    ))}
                  </ul>
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="content flex-grow-1">
        {/* Mobile Sidebar Toggle Button */}
        <div className="d-lg-none p-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes className="icon" /> : <FaBars className="icon" />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
