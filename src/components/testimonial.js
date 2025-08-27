import React, { useState, useEffect } from 'react';
import '../assets/css/testimonial.css';
import studentImage from '../assets/images/testi.png';
import studentImage2 from '../assets/images/testimo.png';

const testimonials = [
  {
    name: 'Husnain Ali',
    text: 'This platform transformed my learning experience! The interactive lessons and expert guidance made complex topics so easy to understand.',
  },
  {
    name: 'Ayesha Khan',
    text: 'Absolutely love how simple yet effective the learning process has become. Highly recommended for every student!',
  },
  {
    name: 'Ali Raza',
    text: 'A one-stop solution for mastering tough subjects. Thank you for making studying enjoyable again!',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass('fade-out');
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setFadeClass('fade-in');
      }, 400); // matches CSS transition duration
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (idx) => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setCurrentIndex(idx);
      setFadeClass('fade-in');
    }, 400);
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-header">
        <div className="heading-wrapper">
          <h2 className="section-heading">What Student's Say</h2>
          <div className="gradient-underline "></div>
        </div>
        <p className="sub-text">
          Hear from our students about how this platform has empowered their learning journey and helped them achieve academic success!
        </p>
      </div>

      <div className="testimonial-flex-wrapper">
       

        <div className="testimonial-content">
          <div className={`testimonial-box ${fadeClass}`}>
            <h4>{testimonials[currentIndex].name}</h4>
            <p>{testimonials[currentIndex].text}</p>
          </div>
          <div className="dots">
            {testimonials.map((_, idx) => (
              <span
                key={idx}
                className={idx === currentIndex ? 'dot active' : 'dot'}
                onClick={() => handleDotClick(idx)}
              ></span>
            ))}
          </div>
        </div>

       
      </div>
    </section>
  );
};

export default TestimonialsSection;
