import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fireStore } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Normalize strings for matching
const normalize = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();

const SectionsTopicsPage = () => {
  const { section } = useParams(); // This is the section clicked
  const navigate = useNavigate();

  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTopics(section);
  }, [section]);

  // 🔹 Fetch topics for the section (class always "grammar")
  const fetchTopics = async (subCategory) => {
    setLoading(true);
    try {
      const q = query(
        collection(fireStore, "topics"),
        where("class", "==", "grammar"),
        where("subCategory", "==", subCategory)
      );

      const snapshot = await getDocs(q);
      const topicData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.topic) topicData[normalize(data.topic)] = data;
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
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
    setLoading(false);
  };

  // 🔹 Handle topic click
  const handleTopicClick = (topicName) => {
    const normalizedKey = normalize(topicName);
    const fileData = topics[normalizedKey];

    if (!fileData) {
      console.warn("Topic not found!", topicName);
      return;
    }

    const topicSlug = topicName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    navigate(`/description/${encodeURIComponent(section)}/${encodeURIComponent(topicSlug)}`);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" , marginTop: "58px" }}>
      <h2>{section}</h2>
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading topics...</p>
      ) : Object.keys(topics).length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          {Object.keys(topics).map((key, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #dee2e6",
                padding: "12px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                color: "#343a40",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "0.2s ease",
              }}
              onClick={() => handleTopicClick(key)}
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
              📌 {topics[key]?.topic || key}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>No topics available for this section.</p>
      )}
    </div>
  );
};

export default SectionsTopicsPage;
