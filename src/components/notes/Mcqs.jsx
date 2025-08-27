import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fireStore } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

const normalize = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();

// Slugify topics exactly like your Notes component
const createSlug = (str) =>
  str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const MCQList = () => {
  const { subCategory, topicSlug } = useParams(); // Grab from URL
  console.log("MCQList params:", subCategory, topicSlug);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMCQs = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(fireStore, "topics"));

        const topics = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            slug: createSlug(data.topic || ""),
          };
        });

        const match = topics.find(
          (t) =>
            normalize(t.subCategory) === normalize(subCategory) &&
            (t.slug === topicSlug || t.id === topicSlug)
        );

        if (match && Array.isArray(match.mcqs)) {
          setMcqs(match.mcqs);
          console.log("MCQs loaded:", match.mcqs);
        } else {
          setMcqs([]);
        }
      } catch (err) {
        console.error("Error loading MCQs:", err);
        setMcqs([]);
      }
      setLoading(false);
    };

    loadMCQs();
  }, [subCategory, topicSlug]);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "20px" }}>Loading MCQs...</p>;
  }

  if (!mcqs || mcqs.length === 0) {
    return <p style={{ textAlign: "center", padding: "20px" }}>No MCQs found.</p>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        MCQs for {topicSlug.replace(/-/g, " ")}
      </h2>

      <ol style={{ lineHeight: "1.8" }}>
        {mcqs.map((mcq, index) => (
          <li key={index} style={{ marginBottom: "15px" }}>
            <strong>{mcq.question}</strong>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {mcq.options?.map((opt, i) => (
                <li key={i} style={{ marginTop: "4px" }}>
                  {String.fromCharCode(65 + i)}. {opt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MCQList;
