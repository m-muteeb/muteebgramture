import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

import img from "../assets/images/new-logo.webp"; // Logo image
import certificateBg from "../../src/assets/images/certificate bg.png"; 

const CertificateGenerator = ({
  mcqs,
  selectedAnswer,
  userName,
  calculateResults,
  topicName,
  onShowResults,
}) => {
  const [isCertificateVisible, setIsCertificateVisible] = useState(false);
  const [certificateData, setCertificateData] = useState({});
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  // Preload background image for reliable capture
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = certificateBg;
    bgImage.crossOrigin = "anonymous"; // Ensure CORS compliance
    bgImage.onload = () => {
      setBgLoaded(true);
    };
    bgImage.onerror = () => {
      console.error("Failed to load background image");
    };
  }, []);

  // Check if certificate was already generated for this user and topic
  useEffect(() => {
    if (userName && topicName) {
      const storageKey = `certificate_${userName}_${topicName}`;
      const alreadyGenerated = localStorage.getItem(storageKey);
      if (alreadyGenerated === "true") {
        setCertificateGenerated(true);
      }
    }
  }, [userName, topicName]);

  // Automatically generate certificate when userName is provided (only once)
  useEffect(() => {
    if (userName && bgLoaded && !certificateGenerated) {
      generateCertificate();
    }
  }, [userName, bgLoaded, certificateGenerated]);

  const generateCertificate = () => {
    const correctAnswers = calculateResults();
    const score = (correctAnswers / mcqs.length) * 100;
    const complement =
      score >= 80 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement";

    setCertificateData({
      topic: topicName.toUpperCase(), // Convert topic to uppercase
      score: correctAnswers,
      complement,
      userName,
    });

    setIsCertificateVisible(true);
    
    // Mark certificate as generated for this user and topic
    const storageKey = `certificate_${userName}_${topicName}`;
    localStorage.setItem(storageKey, "true");
    setCertificateGenerated(true);
  };

  const handleDownloadCertificate = () => {
    const certificateElement = document.querySelector("#certificate");

    // Hide buttons before capturing the certificate
    const footer = document.querySelector("#certificate-footer");
    if (footer) footer.style.display = "none";

    html2canvas(certificateElement, { 
      useCORS: true, 
      allowTaint: false, 
      backgroundColor: null // Preserve transparency if needed
    }).then((canvas) => {
      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${userName}_certificate.png`;
      link.click();

      setIsDownloaded(true);

      // Show the footer again after the image is downloaded
      if (footer) footer.style.display = "flex";
    }).catch((error) => {
      console.error("Error capturing certificate:", error);
      if (footer) footer.style.display = "flex"; // Ensure footer is restored on error
    });
  };

  return (
    <div>
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
              <h2 style={certificateStyles.title}>Achievement Certificate</h2>
            </div>
            <div style={certificateStyles.body}>
              <h1 style={certificateStyles.userName}>{certificateData.userName}</h1>
              <p style={certificateStyles.bodyText}>Has successfully completed the course of</p>
              <h3 style={certificateStyles.topic}>{certificateData.topic}</h3>
              <p style={certificateStyles.bodyText}>with a score of <strong>{certificateData.score}</strong> out of {mcqs.length}</p>
              <p style={certificateStyles.bodyText}>Evaluation: <strong>{certificateData.complement}</strong></p>
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
                Show Correct Answers
              </button>
            </div>
          </div>
        </div>
      )}
      
      {certificateGenerated && !isCertificateVisible && (
        <div style={certificateStyles.alreadyGeneratedMessage}>
          <h3>Certificate Already Generated</h3>
          <p>You have already generated a certificate for this test. 
             Please take the test again to generate a new certificate.</p>
        </div>
      )}
    </div>
  );
};

const certificateStyles = {
  certificate: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "60px 40px",
    border: "3px double #D4AF37",
    borderRadius: "15px",
    textAlign: "center",
    fontFamily: "'Playfair Display', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(to bottom, #f9f2e8, #faf5ef)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    opacity: 0.95,
  },
  content: {
    position: "relative",
    zIndex: 1,
    padding: "30px",
    borderRadius: "8px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
  },
  logo: {
    width: "120px",
    marginBottom: "15px",
    zIndex: 1,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
  },
  title: {
    fontSize: "36px",
    marginBottom: "10px",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    color: "#1a472a",
    letterSpacing: "3px",
    textTransform: "uppercase",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  },
  body: {
    margin: "30px 0",
  },
  bodyText: {
    fontFamily: "'Crimson Text', serif",
    fontSize: "20px",
    lineHeight: "1.6",
    color: "#2c3e50",
    margin: "15px 0",
  },
  userName: {
    fontSize: "48px",
    marginBottom: "20px",
    fontFamily: "'Great Vibes', cursive",
    fontWeight: 400,
    color: "#8b4513",
    textShadow: "2px 2px 3px rgba(0,0,0,0.1)",
  },
  topic: {
    color: "#1a472a",
    fontWeight: 700,
    fontSize: "38px",
    margin: "20px 0",
    fontFamily: "'Cinzel', serif",
    textTransform: "uppercase",
    letterSpacing: "2px",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
    padding: "10px",
    borderTop: "2px solid #D4AF37",
    borderBottom: "2px solid #D4AF37",
  },
  issueDate: {
    fontFamily: "'Crimson Text', serif",
    fontSize: "18px",
    color: "#2c3e50",
    marginTop: "25px",
    fontStyle: "italic",
  },
  footer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    gap: "25px",
  },
  downloadBtn: {
    padding: "14px 28px",
    backgroundColor: "#1a472a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Crimson Text', serif",
    fontSize: "18px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
  alreadyGeneratedMessage: {
    maxWidth: "600px",
    margin: "30px auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "'Crimson Text', serif",
  },
};

export default CertificateGenerator;