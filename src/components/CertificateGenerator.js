import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

import img from "../assets/images/new-logo.webp"; // Logo image

const CertificateGenerator = ({
  mcqs,
  selectedAnswer,
  userName,
  calculateResults,
  topicName,
}) => {
  const [isCertificateVisible, setIsCertificateVisible] = useState(false);
  const [certificateData, setCertificateData] = useState({});
  const [isDownloaded, setIsDownloaded] = useState(false); // Track if the certificate is downloaded

  // Automatically generate certificate when userName is provided
  useEffect(() => {
    if (userName) {
      generateCertificate();
    }
  }, [userName]);

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
    const certificateElement = document.querySelector(".certificate");

    // Hide the download button before capturing the certificate
    const downloadButton = document.querySelector(".certificate-footer button");
    downloadButton.style.display = "none";

    html2canvas(certificateElement).then((canvas) => {
      const imageUrl = canvas.toDataURL();
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${userName}_certificate.png`;
      link.click();

      setIsDownloaded(true); // Set the certificate as downloaded

      // Show the download button again after the image is downloaded
      downloadButton.style.display = "block";
    });
  };

  return (
    <div>
      {isCertificateVisible && (
        <div className="certificate">
          <div className="certificate-header">
            <img src={img} alt="Logo" className="certificate-logo" />
            <h2>Achievement Certificate</h2>
          </div>
          <div className="certificate-body">
            <h1>{certificateData.userName}</h1>
            <p>Has successfully completed the course of</p>
            <h3 className="New-heading" style={{ color: '#16a085', fontWeight: 700 , fontSize: 36 }}>{certificateData.topic}</h3>

            {/* Modified topic text */}
            <p>with a score of <strong>{certificateData.score}</strong> out of {mcqs.length}</p>
            <p>Evaluation: <strong>{certificateData.complement}</strong></p>
            <p style={{marginTop:'20px'}}>Issued on: <strong>{new Date().toLocaleDateString()}</strong></p>
          </div>
          <div className="certificate-footer">
            {!isDownloaded && ( // Only show download button if not downloaded
              <button onClick={handleDownloadCertificate}>
                Download Certificate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;