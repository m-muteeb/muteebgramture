import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fireStore } from "../../config/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";

// 🔹 Normalize for case-insensitive matching
const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, " ").trim();

// 🔹 Shared slugify helper
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const Notes = () => {
  const { selectedClass, subCategory } = useParams();
  const navigate = useNavigate();

  const [subCategories, setSubCategories] = useState([]);
  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(false);
  const [openSubCatId, setOpenSubCatId] = useState(null);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  // Hardcoded categories
  const grammarOnly = [
    "Letters",
    "Stories",
    "Applications",
    "Translations",
    "Condtitional Sentences",
    "Tenses",
    "MCQ Test",
    "Idioms",
    "Direct & Indirect",
  ];
  const commonHardcoded = ["Past Papers", "Guess Paper", "Book Lessons", "MCQ Test"];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSubCategories();
  }, []);

  useEffect(() => {
    if (subCategory && subCategories.length > 0) {
      const index = subCategories.findIndex(
        (name) => normalize(name) === normalize(subCategory)
      );
      if (index !== -1) {
        setOpenSubCatId(index);
        subscribeToTopics(subCategory); // ✅ Live updates
      }
    }
  }, [subCategory, subCategories]);

  // 🔹 Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      if (normalize(selectedClass) === "grammar") {
        setSubCategories(grammarOnly);
        return;
      }

      setSubCategories(commonHardcoded);

      if (!fetchedOnce) {
        setLoading(true);

        const snapshot = await getDocs(collection(fireStore, "subcategories"));
        let subs = snapshot.docs.map((doc) => doc.data().name);

        subs = subs.filter((name) => !grammarOnly.includes(name));

        setSubCategories((prev) => [...prev, ...subs]);

        setFetchedOnce(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setLoading(false);
    }
  };

  // 🔹 Subscribe to topics in realtime
  const subscribeToTopics = (subCatName) => {
    setLoading(true);

    let q;
    if (normalize(selectedClass) === "grammar") {
      q = query(
        collection(fireStore, "topics"),
        where("class", "==", "grammar"),
        where("subCategory", "==", subCatName)
      );
    } else {
      q = query(
        collection(fireStore, "topics"),
        where("class", "==", `Class ${selectedClass}`),
        where("subCategory", "==", subCatName)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const topicData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.topic) {
            const key = normalize(data.topic);
            topicData[key] = {
              ...data,
              slug: data.slug || slugify(data.topic),
            };
          }
        });

        // Sort topics
        const sortedKeys = Object.keys(topicData).sort((a, b) => {
          const numA = parseInt(a.match(/^\d+/)?.[0]);
          const numB = parseInt(b.match(/^\d+/)?.[0]);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });

        const sortedTopics = {};
        sortedKeys.forEach((key) => {
          sortedTopics[key] = topicData[key];
        });

        setTopics(sortedTopics);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching topics:", error);
        setLoading(false);
      }
    );

    return unsubscribe; // ✅ Cleanup if needed
  };

  // 🔹 Handle subcategory click
  const handleSubCategoryClick = (subCatName, index) => {
    const newOpenId = openSubCatId === index ? null : index;
    setOpenSubCatId(newOpenId);

    if (newOpenId !== null) {
      subscribeToTopics(subCatName);
      navigate(`/notes/${selectedClass}/${subCatName}`);
    } else {
      setTopics({});
      navigate(`/notes/${selectedClass}`);
    }

    setTimeout(() => {
      const cardElement = document.querySelectorAll(".subject-card")[index];
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // 🔹 Handle topic click
  const handleTopicClick = (topicKey) => {
    const fileData = topics[topicKey];
    if (!fileData) return;

    const topicSlug = fileData.slug;
    const currentSubCategory = subCategories[openSubCatId];

    navigate(
      `/description/${encodeURIComponent(currentSubCategory)}/${encodeURIComponent(
        topicSlug
      )}`
    );
  };

  // 🔹 Styles
  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px 20px 250px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    alignItems: "flex-start",
  };

  const cardStyle = (isActive) => ({
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: `2px solid ${isActive ? "#007bff" : "transparent"}`,
    transition: "all 0.3s ease",
    overflow: "visible",
    position: "relative",
  });

  const headerStyle = {
    padding: "16px 20px",
    fontSize: "18px",
    fontWeight: "600",
    backgroundColor: "#f1f3f5",
    color: "#343a40",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "12px 12px 0 0",
    transition: "background 0.2s",
  };

  const dropdownStyle = {
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e9ecef",
    borderRadius: "0 0 12px 12px",
    maxHeight: "60vh",
    overflowY: "auto",
    position: "relative",
    zIndex: 10,
  };

  const dropdownContentStyle = {
    padding: "20px",
  };

  const topicsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "10px",
  };

  const topicItemStyle = {
    background: "#ffffff",
    border: "1px solid #dee2e6",
    padding: "12px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    color: "#343a40",
    transition: "0.2s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    wordWrap: "break-word",
  };

  const loadingStyle = {
    padding: "20px 0",
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <main>
        <h2>Welcome to Our Educational Portal</h2>
        <p
          style={{ textAlign: "center", padding: "20px 0", fontWeight: "bold" }}
        >
          Our goal is to provide high-quality educational resources.
        </p>

        <div style={gridStyle}>
          {subCategories.map((subCatName, index) => (
            <div
              key={index}
              className="subject-card"
              style={cardStyle(openSubCatId === index)}
            >
              <div
                style={headerStyle}
                onClick={() => handleSubCategoryClick(subCatName, index)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e9ecef";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f1f3f5";
                }}
              >
                <span>{subCatName}</span>
                <span>{openSubCatId === index ? "▼" : "►"}</span>
              </div>

              {openSubCatId === index && (
                <div style={dropdownStyle}>
                  <div style={dropdownContentStyle}>
                    {loading ? (
                      <div style={loadingStyle}>Loading...</div>
                    ) : Object.keys(topics).length > 0 ? (
                      <div style={topicsGridStyle}>
                        {Object.keys(topics).map((topicKey, i) => (
                          <div
                            key={i}
                            style={topicItemStyle}
                            onClick={() => handleTopicClick(topicKey)}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#f1f9ff";
                              e.target.style.color = "#007bff";
                              e.target.style.borderColor = "#007bff";
                              e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#ffffff";
                              e.target.style.color = "#343a40";
                              e.target.style.borderColor = "#dee2e6";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            📌 {topics[topicKey]?.topic || topicKey}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={loadingStyle}>No topics available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notes;
