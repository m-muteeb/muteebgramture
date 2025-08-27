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

  // Automatically generate certificate when userName is provided
  useEffect(() => {
    if (userName && bgLoaded) {
      generateCertificate();
    }
  }, [userName, bgLoaded]);

  const generateCertificate = () => {
    const correctAnswers = calculateResults();
    const score = (correctAnswers / mcqs.length) * 100;
    const complement =
      score >= 80 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement";

    setCertificateData({
      topic: topicName,
      score: correctAnswers,
      complement,
      userName,
    });

    setIsCertificateVisible(true);
  };

  const handleDownloadCertificate = () => {
    const certificateElement = document.querySelector("#certificate");

    // Hide buttons before capturing the certificate
    const footer = document.querySelector("#certificate-footer");
    footer.style.display = "none";

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
      footer.style.display = "flex";
    }).catch((error) => {
      console.error("Error capturing certificate:", error);
      footer.style.display = "flex"; // Ensure footer is restored on error
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
              <p>Has successfully completed the course of</p>
              <h3 style={certificateStyles.topic}>{certificateData.topic}</h3>
              <p>with a score of <strong>{certificateData.score}</strong> out of {mcqs.length}</p>
              <p>Evaluation: <strong>{certificateData.complement}</strong></p>
              <p style={{ marginTop: '20px' }}>
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
    </div>
  );
};

const certificateStyles = {
  certificate: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "40px",
    border: "2px solid gold",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 1,
  
    padding: "20px",
    borderRadius: "5px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: "100px",
    marginBottom: "10px",
    zIndex: 1,
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  body: {
    margin: "20px 0",
  },
  userName: {
    fontSize: "36px",
    marginBottom: "10px",
  },
  topic: {
    color: "#16a085",
    fontWeight: 700,
    fontSize: "36px",
    margin: "10px 0",
  },
  footer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  downloadBtn: {
    padding: "10px 20px",
    backgroundColor: "#1d72b8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default CertificateGenerator;