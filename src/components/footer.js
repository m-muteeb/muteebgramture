import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaWhatsapp, FaGithub } from "react-icons/fa";
import logo from "../assets/images/navbarlogo.webp";
import "../assets/css/footer.css";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <>
      <hr style={{ margin: "0", borderTop: "1px solid #ccc" }} />
      <footer
        className="text-center text-lg-start text-dark"
      // style={{ backgroundColor: "#F2F4F5" }}
      >
        <section>
          <div className="container text-center text-md-start pt-5 mt-1">
            <div className="row mt-2">

              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-1">
                <div style={{ display: "flex", alignItems: "flex-center", gap: "10px", marginBottom: "10px" }}>
                  <div className="footer-image">
                    <img src={logo} alt="Logo" />
                  </div>

                  <h3 className="text-dark" style={{ marginTop: '5px' }}>Gramture</h3>
                </div>
                <p className="mb-0 text-dark">
                  Gramture is an innovative educational platform dedicated to empowering students with high-quality learning resources. We offer engaging courses, interactive quizzes, and expert guidance to help learners achieve academic excellence.
                </p>

                {/* Social Media Icons */}
                <div className="social-icons mt-3 d-flex text-center gap-3">
                  <a href="https://www.facebook.com/Gramture" target="_blank" rel="noopener noreferrer">
                    <FaFacebook size={24} className="social-icon facebook" />
                  </a>
                  <a href="https://twitter.com/Gramture" target="_blank" rel="noopener noreferrer">
                    <FaTwitter size={24} className="social-icon twitter" />
                  </a>
                  <a href="https://www.instagram.com/gramture/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={24} className="social-icon instagram" />
                  </a>
                  <a href="https://www.youtube.com/@gramture" target="_blank" rel="noopener noreferrer">
                    <FaYoutube size={24} className="social-icon youtube" />
                  </a>
                  <a href="https://wa.me/+923036660025" target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp size={24} className="social-icon whatsapp" style={{ color: '#25d366' }} />
                  </a>
                  <a href="https://www.linkedin.com/in/habib-ahmad-khan-b75a6b9a" target="_blank" rel="noopener noreferrer">
                    <FaLinkedin size={24} className="social-icon linkedin" style={{ color: '#0e76a8' }} />
                  </a>
                  <a href="https://github.com/habibahmadakhan" target="_blank" rel="noopener noreferrer">
                    <FaGithub size={24} className="social-icon github" style={{ color: '#808080' }} />
                  </a>
                </div>

              </div>

              {/* Features */}
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Features</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="/notes/${selectedClass}/${subjectName.toLowerCase()}/${type}" className="text-dark" style={{ textDecoration: "none" }}>
                    Notes
                  </Link>
                </p>
                <p>
                  <Link to="/faqs" className="text-dark" style={{ textDecoration: "none" }}>
                    FAQs
                  </Link>
                </p>
                <p>
                  <Link to="/privacypolicy" className="text-dark" style={{ textDecoration: "none" }}>
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Important Sections */}
              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Important Sections</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "#8B0000",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="/about" className="text-dark" style={{ textDecoration: "none" }}>
                    About
                  </Link>
                </p>
                <p>
                  <Link to="/institutionpage" className="text-dark" style={{ textDecoration: "none" }}>
                    MCQS
                  </Link>
                </p>
                <p>
                  <Link to="/contact" className="text-dark" style={{ textDecoration: "none" }}>
                    Contact Us
                  </Link>
                </p>
              </div>

              {/* Contact */}
              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mt-3">
                <h6 className="text-uppercase fw-bold">Contact</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="tel:30000000000" className="text-dark" style={{ textDecoration: "none" }}>
                    0303-6660025
                  </Link>
                </p>
               <p className="mt-2">
                  Ground Floor, Near AB Printers, Makkah Center, Aminpur Bazaar, Faisalabad
                </p>
                <p>
                  <Link to="mailto:theambitious.edu@gmail.com" className="text-dark" style={{ textDecoration: "none" }}>
                    gramture@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr />

        {/* Copyright and Developer Credit */}
        <div className="text-center text-dark pb-3">
          <p className="fw-bold mb-1">
            Copyright © {year}. All Rights Reserved.
          </p>
          <p className="fw-bold mb-0">
            Designed by{" "}
            <a
              href="http://code-nexus-pk.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "red", fontWeight: "bold", textDecoration: "none" }}
            >
              Code Nexus
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
