import React, { useEffect } from 'react';
import { Row, Col, Image } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom'; // Using React Router for navigation
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import myImage from '../assets/images/owner.webp';
import aboutImg from '../assets/images/about.webp';
import "../assets/css/about.css";

const About = () => {

    useEffect(() => {
          window.scrollTo(0, 0);
      }, []);

  return (
    <div className='container about-sect' id='about'>
      {/* About Section */}
      <Row className="align-items-center my-5">
        <Col xs={24} md={16}>
          <div className="about-grammar-content pe-md-4">
            <h2 className="text-center fw-bold mt-5">Welcome to the Gramture Platform!</h2>
            <div className="gramture-desc">
            <p>
              Gramture is a revolutionary platform designed to make learning grammar and language structures simpler and more approachable. Whether you're a student, teacher, or lifelong learner, our platform offers a wide range of resources that aim to enhance your understanding of grammar in an easy-to-understand way.
            </p>
            <p>
              Gramture, a blend of the words <span className="highlight">Grammar</span> and <span className="highlight">Structure</span>, symbolizes a modern approach to education. Our platform provides an enriching experience that simplifies grammar concepts and structures, enabling better communication skills for writing, speaking, and overall literacy.
            </p>
            <p>
              At Gramture, we offer comprehensive study materials, practice exercises, and engaging tools to make learning grammar both educational and enjoyable. Our mission is to help learners of all levels gain confidence and proficiency in language.
            </p>
            </div>
          </div>
        </Col>
        <Col xs={24} md={8} className='about-image-col'>
          <Image
            src={aboutImg}
            alt="About"
            fill // Makes the image fill its container
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizing
            className="rounded-2"
            style={{
              borderRadius: '8px',
              objectFit: 'cover', // Ensures proper filling without distortion
              maxWidth: '75%', // Ensures responsiveness
              height: 'auto', // Maintains aspect ratio
              marginTop: '20px', // Adds some space above the image
            }}
          />
        </Col>
      </Row>

      {/* CEO Section */}
    <Row gutter={[16, 16]} className="my-5 ceo-section-row">
        <Col xs={24} md={8} className="text-center mt-5">
          <Image
            width={230}
            height={230}
            src={myImage}
            alt='Habib Ahmad Khan'
            className="rounded-2"
            style={{ borderRadius: '8px' }}
          />
          <h4 className="fw-bold">Habib Ahmad Khan</h4>
          <p className="mb-1 fw-bold">Founder & CEO of Gramture</p>
          <p className="small mb-2" style={{ fontSize: '0.8rem'}}>
            At Gramture, we're redefining how grammar is taught, providing top-notch resources that revolutionize grammar education.
          </p>
          <div className="social-icons d-flex justify-content-center gap-3">
            <a href="https://www.facebook.com/Gramture" target="_blank" rel="noreferrer" className="facebook"><FaFacebook /></a>
            <a href="https://twitter.com/Gramture" target="_blank" rel="noreferrer" className="twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/gramture/" target="_blank" rel="noreferrer" className="instagram"><FaInstagram /></a>
            <a href="https://www.youtube.com/@gramture" target="_blank" rel="noreferrer" className="youtube"><FaYoutube /></a>
            <a href="https://wa.me/+923036660025" target="_blank" rel="noreferrer" className="whatsapp"><FaWhatsapp /></a>
          </div>
        </Col>

        <Col xs={24} md={16} className='mt-5'>
          <div className="ceo-message">
            <h3 className="fw-bold mb-3">A Message from Our CEO</h3>
            <p className='ceo-desc'>
              We’re not just another platform; Gramture is a movement. Our mission is to empower every learner with the tools they need to master grammar, develop communication skills, and build their confidence in using language effectively.
            </p>
            <p>
              Through innovative learning methods, personalized study paths, and high-quality content, we are changing the way grammar is perceived and learned. We invite you to be part of this exciting journey.
            </p>
            <p>
              At Gramture, we’re committed to turning grammar mastery into a lifelong advantage — empowering learners to express themselves with clarity, confidence, and impact.
            </p>
          </div>
        </Col>
      </Row>

      {/* Zig-Zag Style Card Section */}
      <div className="my-5 py-4">
        <h2 className="text-center fw-bold mb-4">Explore Our Exclusive Features</h2>

          
        <Row gutter={[24, 24]} justify="center">
          
     
          {/* First Zig-Zag Card (Left) */}
      
          <Col xs={24} sm={12} md={6}>
          <div className="feature-card">
            <div className="feature-card-left text-center p-4">
              <h5 className="fw-bold mb-2">🌟 Topper Choice Notes</h5>
              <p className="text-muted">Gain access to expertly curated notes used by top scorers to ensure you ace your exams with ease!</p>
              <Link to="/" className="btn btn-primary">Explore Now</Link>
            </div>
              </div>
          </Col>

          {/* Second Zig-Zag Card (Right) */}
          <Col xs={24} sm={12} md={6}>
           <div className="feature-card">
            <div className="feature-card-right text-center p-4">
              <h5 className="fw-bold mb-2">📝 Board Pattern Tests with Certification</h5>
              <p className="text-muted">Take board-patterned tests, get certified, and boost your readiness for upcoming exams!</p>
              <Link to="/s" className="btn btn-primary">Explore Now</Link>
            </div>
            </div>
          </Col>

          {/* Third Zig-Zag Card (Left) */}
          <Col xs={24} sm={12} md={6}>
            <div className="feature-card">
            <div className="feature-card-left text-center p-4">
              <h5 className="fw-bold mb-2">💬 Discussion Forum with Expert Faculty</h5>
              <p className="text-muted">Join our interactive forum and engage with expert faculty to clear all your grammar-related doubts!</p>
              <Link to="/discussion_forum" className="btn btn-primary">Join Now</Link>
            </div>
            </div>
          </Col>

          {/* Fourth Zig-Zag Card (Right) - New Card */}
          <Col xs={24} sm={12} md={6}>
               <div className="feature-card">
            <div className="feature-card-right text-center p-4">
              <h5 className="fw-bold mb-2">🎓 Expert Tips for Achieving the Highest Marks</h5>
              <p className="text-muted">Learn time-tested strategies to secure the highest marks across all subjects and exams.</p>
              <Link to="/" className="btn btn-primary">Explore Now</Link>
            </div>
            </div>
           
          </Col>
       
       
        </Row>
          
        
      </div>
    </div>
  );
};

export default About;
