import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fireStore } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import CertificateGenerator from "../CertificateGenerator"; // Adjust path as needed
import { motion } from "framer-motion"; // For animations

const normalize = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();
const createSlug = (str) =>
  str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Helper to strip HTML tags
const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const MCQList = () => {
  const { subCategory, topicSlug } = useParams();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());

  useEffect(() => {
    const loadMCQs = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(fireStore, "topics"));
        const topics = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          slug: createSlug(doc.data().topic || ""),
        }));

        const match = topics.find(
          (t) =>
            normalize(t.subCategory) === normalize(subCategory) &&
            (t.slug === topicSlug || t.id === topicSlug)
        );

        if (match && Array.isArray(match.mcqs)) {
          setMcqs(match.mcqs);
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

  useEffect(() => {
    if (quizFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quizFinished]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [showResults, showCertificate]);

  const handleOptionChange = (qIndex, value) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [qIndex]: value };
      setSkippedQuestions((prev) => {
        const newSkipped = new Set(prev);
        newSkipped.delete(qIndex);
        return newSkipped;
      });
      return newAnswers;
    });
  };

  const handleSkip = () => {
    setSkippedQuestions((prev) => new Set(prev).add(currentIndex));
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleJumpToQuestion = (index) => setCurrentIndex(index);

  const handleSubmit = () => setQuizFinished(true);

  const calculateResults = () => {
    let correct = 0;
    mcqs.forEach((mcq, idx) => {
      const selectedIdx = answers[idx];
      if (selectedIdx !== undefined && mcq.options[selectedIdx] === mcq.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getCorrectIndex = (mcq) => mcq.options.findIndex((opt) => opt === mcq.correctAnswer);

  const handleShowResults = () => {
    setShowResults(true);
    setShowCertificate(false);
  };

  const handleGenerateCertificate = () => {
    if (userName.trim()) {
      setShowCertificate(true);
      setShowResults(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading MCQs...</p>
      </motion.div>
    );
  }

  if (!mcqs || mcqs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorContainer}>
        <p style={styles.errorText}>No MCQs found for this topic.</p>
      </motion.div>
    );
  }

  const currentMcq = mcqs[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;
  const isLast = currentIndex === mcqs.length - 1;
  const score = calculateResults();
  const percentage = ((score / mcqs.length) * 100).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={styles.container}>
    

      {!quizFinished && (
        <div style={styles.quizContainer}>
          <div style={styles.header}>
            <div style={styles.progress}>
              Question {currentIndex + 1} of {mcqs.length}
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}></div>
              </div>
            </div>
            <div style={styles.timer}>Time: {formatTime(timeLeft)}</div>
          </div>

          <div style={styles.questionNavigator}>
            {mcqs.map((_, idx) => (
              <button
                key={idx}
                style={{
                  ...styles.navBubble,
                  backgroundColor: idx === currentIndex ? "#1d72b8" : answers[idx] !== undefined ? "#68d391" : skippedQuestions.has(idx) ? "#f6ad55" : "#e2e8f0",
                  color: idx === currentIndex ? "#fff" : "#333",
                }}
                onClick={() => handleJumpToQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={styles.mcqItem}>
            <p style={styles.question}>
              {currentIndex + 1}. {stripHtml(currentMcq.question)}
            </p>
            <ul style={styles.optionsList}>
              {currentMcq.options?.map((opt, i) => (
                <motion.li key={i} whileHover={{ scale: 1.02 }} style={{ ...styles.optionItem, backgroundColor: answers[currentIndex] === i ? "#d9f0ff" : "#fff" }}>
                  <label style={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`q-${currentIndex}`}
                      value={i}
                      checked={answers[currentIndex] === i}
                      onChange={() => handleOptionChange(currentIndex, i)}
                      style={styles.radioInput}
                      disabled={quizFinished}
                    />
                    <span>{String.fromCharCode(65 + i)}. {stripHtml(opt)}</span>
                  </label>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div style={styles.navigation}>
            <button style={{ ...styles.navButton, opacity: currentIndex === 0 ? 0.5 : 1, cursor: currentIndex === 0 ? "not-allowed" : "pointer" }} onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
            <button style={styles.navButton} onClick={handleSkip}>Skip</button>
            <button style={{ ...styles.navButton, opacity: !isAnswered || isLast ? 0.5 : 1, cursor: !isAnswered || isLast ? "not-allowed" : "pointer" }} onClick={handleNext} disabled={!isAnswered || isLast}>Next</button>
          </div>

          {isLast && isAnswered && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.submitBtn} onClick={handleSubmit}>
              Submit Quiz
            </motion.button>
          )}
        </div>
      )}

      {quizFinished && !showCertificate && !showResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.resultBox}>
          <h2 style={styles.resultTitle}>Quiz Completed!</h2>
          <p style={styles.resultText}>You scored {score} out of {mcqs.length} ({percentage}%)</p>
          <p style={styles.resultText}>Time Taken: {formatTime(timeLeft)}</p>
          <div style={styles.nameInput}>
            <input type="text" placeholder="Enter your full name for certificate" value={userName} onChange={(e) => setUserName(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.buttonGroup}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ ...styles.submitBtn, opacity: !userName.trim() ? 0.5 : 1, cursor: !userName.trim() ? "not-allowed" : "pointer" }} onClick={handleGenerateCertificate} disabled={!userName.trim()}>Generate Certificate</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.submitBtn} onClick={handleShowResults}>View Detailed Results</motion.button>
          </div>
        </motion.div>
      )}

      {quizFinished && showResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.resultBox}>
          <h2 style={styles.resultTitle}>Detailed Results</h2>
          <p style={styles.resultText}>You scored {score} out of {mcqs.length} ({percentage}%)</p>
          <ol style={styles.mcqList}>
            {mcqs.map((mcq, index) => {
              const selectedIdx = answers[index];
              const correctIdx = getCorrectIndex(mcq);
              return (
                <li key={index} style={styles.mcqItem}>
                  <p style={styles.question}>{index + 1}. {stripHtml(mcq.question)}</p>
                  <ul style={styles.optionsList}>
                    {mcq.options?.map((opt, i) => (
                      <li key={i} style={{ ...styles.optionItem, ...(i === correctIdx ? styles.correctOption : {}), ...(selectedIdx === i && selectedIdx !== correctIdx ? styles.wrongOption : {}) }}>
                        <span>{String.fromCharCode(65 + i)}. {stripHtml(opt)}{i === correctIdx && <span style={styles.correctMark}> ✓</span>}{selectedIdx === i && selectedIdx !== correctIdx && <span style={styles.wrongMark}> ✗</span>}</span>
                      </li>
                    ))}
                  </ul>
                  {mcq.description && <p style={styles.description}><strong>Explanation:</strong> {stripHtml(mcq.description)}</p>}
                </li>
              );
            })}
          </ol>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.submitBtn} onClick={() => setShowResults(false)}>Back to Results</motion.button>
        </motion.div>
      )}

      {showCertificate && (
        <CertificateGenerator
          mcqs={mcqs}
          selectedAnswer={answers}
          userName={userName}
          calculateResults={calculateResults}
          topicName={topicSlug.replace(/-/g, " ")}
          percentage={percentage}
          timeTaken={formatTime(timeLeft)}
          onShowResults={handleShowResults}
        />
      )}
    </motion.div>
  );
};

// Styles remain the same as your original component
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "30px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a202c",
    letterSpacing: "-0.025em",
  },
  quizContainer: {
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  progress: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    marginTop: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1d72b8",
    transition: "width 0.3s ease-in-out",
  },
  timer: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2d3748",
    backgroundColor: "#edf2f7",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  questionNavigator: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "30px",
    justifyContent: "center",
  },
  navBubble: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  mcqItem: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  question: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  optionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  optionItem: {
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "10px",
    transition: "background-color 0.2s ease",
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.1rem",
    color: "#2d3748",
    cursor: "pointer",
  },
  radioInput: {
    marginRight: "12px",
    accentColor: "#1d72b8",
    width: "20px",
    height: "20px",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  navButton: {
    padding: "10px 20px",
    backgroundColor: "#1d72b8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    padding: "12px 28px",
    backgroundColor: "#1d72b8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "30px",
  },
  resultBox: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  resultTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "20px",
  },
  resultText: {
    fontSize: "1.2rem",
    color: "#2d3748",
    marginBottom: "15px",
  },
  nameInput: {
    margin: "20px 0",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    width: "300px",
    maxWidth: "100%",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  mcqList: {
    listStyle: "none",
    padding: 0,
    margin: "20px 0",
  },
  correctOption: {
    backgroundColor: "#e6fffa",
    color: "#1a4731",
    padding: "12px 16px",
    borderRadius: "8px",
  },
  wrongOption: {
    backgroundColor: "#fff5f5",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: "8px",
  },
  correctMark: {
    color: "#1a4731",
    marginLeft: "10px",
    fontWeight: "bold",
  },
  wrongMark: {
    color: "#721c24",
    marginLeft: "10px",
    fontWeight: "bold",
  },
  description: {
    marginTop: "15px",
    fontSize: "1rem",
    color: "#4a5568",
    lineHeight: "1.6",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #1d72b8",
    borderTop: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "1.2rem",
    color: "#2d3748",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    margin: "40px auto",
    maxWidth: "600px",
  },
  errorText: {
    fontSize: "1.2rem",
    color: "#c53030",
  },
};


const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default MCQList;
