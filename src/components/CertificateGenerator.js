import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from "html2canvas";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from '../config/firebase';
import img from "../assets/images/new-logo.webp";
import certificateBg from "../../src/assets/images/certificate bg.png";

const CertificateGenerator = ({
  mcqs,
  selectedAnswer,
  calculateResults,
  topicName,
  onShowResults,
}) => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [isCertificateVisible, setIsCertificateVisible] = useState(false);
  const [certificateData, setCertificateData] = useState({});
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = certificateBg;
    bgImage.crossOrigin = "anonymous";
    bgImage.onload = () => {
      setBgLoaded(true);
    };
    bgImage.onerror = () => {
      console.error("Failed to load background image");
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && bgLoaded && !certificateGenerated) {
      generateCertificate();
    } else if (!user && bgLoaded) {
      setShowLogin(true);
    }
  }, [user, bgLoaded, certificateGenerated]);

  const generateCertificate = async () => {
    const correctAnswers = calculateResults();
    const score = (correctAnswers / mcqs.length) * 100;
    const complement = score >= 80 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement";
    const userNameToUse = user?.displayName || name || 'User';

    let topicAttempts = 1;
    if (user) {
      const certDocRef = doc(db, "certificates", `${user.uid}_${topicName}`);
      const certSnap = await getDoc(certDocRef);
      if (certSnap.exists()) {
        topicAttempts = (certSnap.data().attempts || 0) + 1;
      }
    }
    setAttempts(topicAttempts);

    setCertificateData({
      topic: topicName.toUpperCase(),
      score: correctAnswers,
      complement,
      userName: userNameToUse,
      attempts: topicAttempts,
    });

    setIsCertificateVisible(true);
    sendToFirebase(correctAnswers, complement, topicAttempts, userNameToUse);
    setCertificateGenerated(true);
  };

  const sendToFirebase = async (correctAnswers, complement, topicAttempts, userNameToUse) => {
    if (!user) return;

    const certDocRef = doc(db, "certificates", `${user.uid}_${topicName}`);
    await setDoc(certDocRef, {
      userId: user.uid,
      userName: userNameToUse,
      topic: topicName,
      score: correctAnswers,
      totalQuestions: mcqs.length,
      complement,
      issueDate: new Date().toISOString(),
      attempts: topicAttempts,
    }, { merge: true });

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userClass = userSnap.exists() ? userSnap.data().class : '';

    const topperDocRef = doc(db, "toppers", user.uid);
    const topperSnap = await getDoc(topperDocRef);
    let totalAttempts = (topperSnap.exists() ? (topperSnap.data().totalAttempts || 0) : 0) + 1;
    await setDoc(topperDocRef, {
      name: userNameToUse,
      class: userClass,
      score: correctAnswers,
      totalQuestions: mcqs.length,
      topic: topicName,
      email: user.email,
      lastUpdated: new Date().toISOString(),
      totalAttempts,
    }, { merge: true });
  };

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !className) {
      setError('All fields are required');
      return;
    }
    if (className < 1 || className > 12) {
      setError('Class must be between 1 and 12');
      return;
    }
    
    setIsRegisterLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        name,
        class: className,
        email,
      });
      toast.success("Welcome! You have completed one step to become a topper!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setShowRegister(false);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    setIsLoginLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        name,
        email,
      }, { merge: true });
      setShowLogin(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    const certificateElement = document.querySelector("#certificate");
    const footer = document.querySelector("#certificate-footer");
    if (footer) footer.style.display = "none";

    html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: window.devicePixelRatio,
    }).then((canvas) => {
      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${certificateData.userName}_certificate.png`;
      link.click();
      setIsDownloaded(true);
      if (footer) footer.style.display = "flex";
    }).catch((error) => {
      console.error("Error capturing certificate:", error);
      if (footer) footer.style.display = "flex";
    });
  };

  return (
    <div>
      <ToastContainer />
      {showRegister && (
        <div style={modalStyles.modal}>
          <div style={modalStyles.modalContent}>
            <h2 style={modalStyles.title}>Register to Shine</h2>
            {error && <p style={modalStyles.error}>{error}</p>}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={modalStyles.input}
            />
            <input
              type="number"
              placeholder="Class (1-12)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              min="1"
              max="12"
              style={modalStyles.input}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={modalStyles.input}
            />
            <input
              type="password"
              placeholder="Password for gramture"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={modalStyles.input}
            />
            <button 
              onClick={handleRegister} 
              style={modalStyles.button}
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? "Loading..." : "Register"}
            </button>
            <p style={modalStyles.text}>
              Already registered?{" "}
              <span
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                style={modalStyles.link}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      )}
      {showLogin && (
        <div style={modalStyles.modal}>
          <div style={modalStyles.modalContent}>
            <h2 style={modalStyles.title}>Login to Generate Certificate</h2>
            {error && <p style={modalStyles.error}>{error}</p>}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={modalStyles.input}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={modalStyles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={modalStyles.input}
            />
            <button 
              onClick={handleLogin} 
              style={modalStyles.button}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Loading..." : "Login"}
            </button>
            <p style={modalStyles.text}>
              No account?{" "}
              <span
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                style={modalStyles.link}
              >
                Register
              </span>
            </p>
          </div>
        </div>
      )}
      {isCertificateVisible && (
        <div id="certificate" style={certificateStyles.certificate}>
          <img
            src={certificateBg}
            alt="Certificate Background"
            style={certificateStyles.backgroundImage}
          />
          <div style={certificateStyles.content}>
            <div style={certificateStyles.header}>
              <img src={img} alt="Logo" style={certificateStyles.logo} />
              <h2 style={certificateStyles.title}>Certificate of Achievement</h2>
            </div>
            <div style={certificateStyles.body}>
              <h1 style={certificateStyles.userName}>{certificateData.userName}</h1>
              <p style={certificateStyles.bodyText}>Has successfully completed the course</p>
              <h3 style={certificateStyles.topic}>{certificateData.topic}</h3>
              <p style={certificateStyles.bodyText}>
                with a score of <strong>{certificateData.score}</strong> out of {mcqs.length}
              </p>
              <p style={certificateStyles.bodyText}>
                Evaluation: <strong>{certificateData.complement}</strong>
              </p>
              <p style={certificateStyles.bodyText}>
                Attempt: <strong>{certificateData.attempts}</strong>
              </p>
              <p style={certificateStyles.issueDate}>
                Issued on: <strong>{new Date().toLocaleDateString()}</strong>
              </p>
            </div>
            <div id="certificate-footer" style={certificateStyles.footer}>
              {!isDownloaded && (
                <button style={certificateStyles.downloadBtn} onClick={handleDownloadCertificate}>
                  Download Certificate
                </button>
              )}
              <button style={certificateStyles.downloadBtn} onClick={onShowResults}>
                View Correct Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const certificateStyles = {
  certificate: {
    maxWidth: "90vw",
    width: "100%",
    margin: "20px auto",
    padding: "5vw 4vw",
    border: "4px double #D4AF37",
    borderRadius: "2vw",
    textAlign: "center",
    fontFamily: "'Playfair Display', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f9f2e8 0%, #faf5ef 100%)",
    boxShadow: "0 2vw 4vw rgba(0,0,0,0.2)",
    "@media (max-width: 600px)": {
      padding: "6vw 5vw",
      border: "2px double #D4AF37",
      borderRadius: "3vw",
    },
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    opacity: 0.9,
    filter: "brightness(1.1)",
  },
  content: {
    position: "relative",
    zIndex: 1,
    padding: "4vw",
    borderRadius: "1.2vw",
    "@media (max-width: 600px)": {
      padding: "5vw",
    },
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "4vw",
  },
  logo: {
    width: "15vw",
    maxWidth: "140px",
    marginBottom: "2vw",
    zIndex: 1,
    filter: "drop-shadow(0 0.3vw 0.6vw rgba(0,0,0,0.3))",
    "@media (max-width: 600px)": {
      width: "20vw",
      maxWidth: "100px",
    },
  },
  title: {
    fontSize: "4vw",
    maxFontSize: "40px",
    marginBottom: "1.5vw",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    color: "#1a472a",
    letterSpacing: "0.4vw",
    textTransform: "uppercase",
    textShadow: "0.1vw 0.1vw 0.3vw rgba(0,0,0,0.15)",
    "@media (max-width: 600px)": {
      fontSize: "6vw",
      maxFontSize: "28px",
      letterSpacing: "0.3vw",
    },
  },
  body: {
    margin: "4vw 0",
    "@media (max-width: 600px)": {
      margin: "5vw 0",
    },
  },
  bodyText: {
    fontFamily: "'Crimson Text', serif",
    fontSize: "2.2vw",
    maxFontSize: "22px",
    lineHeight: 1.7,
    color: "#2c3e50",
    margin: "1.5vw 0",
    "@media (max-width: 600px)": {
      fontSize: "3.5vw",
      maxFontSize: "18px",
      margin: "2vw 0",
    },
  },
  userName: {
    fontSize: "5.4vw",
    maxFontSize: "54px",
    marginBottom: "2.5vw",
    fontFamily: "'Great Vibes', cursive",
    fontWeight: 400,
    color: "#8b4513",
    textShadow: "0.2vw 0.2vw 0.4vw rgba(0,0,0,0.15)",
    "@media (max-width: 600px)": {
      fontSize: "8vw",
      maxFontSize: "36px",
      marginBottom: "3vw",
    },
  },
  topic: {
    color: "#1a472a",
    fontWeight: 700,
    fontSize: "4.2vw",
    maxFontSize: "42px",
    margin: "2.5vw 0",
    fontFamily: "'Cinzel', serif",
    textTransform: "uppercase",
    letterSpacing: "0.3vw",
    textShadow: "0.1vw 0.1vw 0.3vw rgba(0,0,0,0.15)",
    padding: "1.2vw",
    borderTop: "0.3vw solid #D4AF37",
    borderBottom: "0.3vw solid #D4AF37",
    "@media (max-width: 600px)": {
      fontSize: "6vw",
      maxFontSize: "28px",
      padding: "2vw",
      borderTop: "0.4vw solid #D4AF37",
      borderBottom: "0.4vw solid #D4AF37",
    },
  },
  issueDate: {
    fontFamily: "'Crimson Text', serif",
    fontSize: "2vw",
    maxFontSize: "20px",
    color: "#2c3e50",
    marginTop: "3vw",
    fontStyle: "italic",
    "@media (max-width: 600px)": {
      fontSize: "3vw",
      maxFontSize: "16px",
      marginTop: "4vw",
    },
  },
  footer: {
    marginTop: "5vw",
    display: "flex",
    justifyContent: "center",
    gap: "3vw",
    flexWrap: "wrap",
    "@media (max-width: 600px)": {
      gap: "2vw",
      flexDirection: "column",
      alignItems: "center",
    },
  },
  downloadBtn: {
    padding: "1.6vw 3.2vw",
    background: "linear-gradient(45deg, #1a472a, #2a6b3f)",
    color: "#fff",
    border: "none",
    borderRadius: "0.8vw",
    cursor: "pointer",
    fontFamily: "'Crimson Text', serif",
    fontSize: "2vw",
    maxFontSize: "20px",
    fontWeight: 600,
    letterSpacing: "0.1vw",
    transition: "all 0.3s ease",
    boxShadow: "0 0.6vw 1.2vw rgba(0,0,0,0.2)",
    "@media (max-width: 600px)": {
      padding: "2.5vw 5vw",
      fontSize: "3.5vw",
      maxFontSize: "16px",
      borderRadius: "1vw",
    },
  },
};

const modalStyles = {
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#ffffff",
    padding: "1.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "350px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontFamily: "'Playfair Display', serif",
    color: "#1a472a",
    marginBottom: "1rem",
    fontWeight: 700,
  },
  input: {
    display: "block",
    width: "100%",
    margin: "0.5rem 0",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontFamily: "'Crimson Text', serif",
    fontSize: "1rem",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "linear-gradient(45deg, #1a472a, #2a6b3f)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Crimson Text', serif",
    fontSize: "1rem",
    fontWeight: 600,
    transition: "background 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    marginTop: "0.5rem",
  },
  link: {
    color: "#1a472a",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: 600,
    transition: "color 0.3s ease",
  },
  text: {
    fontFamily: "'Crimson Text', serif",
    fontSize: "0.9rem",
    color: "#2c3e50",
    marginTop: "1rem",
  },
  error: {
    color: "#d32f2f",
    marginBottom: "1rem",
    fontFamily: "'Crimson Text', serif",
    fontSize: "0.9rem",
  },
};

export default CertificateGenerator;