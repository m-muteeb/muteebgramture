import React from 'react';
import '../assets/css/subscribe.css'; // Import your CSS file for styling

const SubscribeNewsletter = () => {
  return (
    <div className="newsletter-wrapper">
      <div className="newsletter-container">
        <div className="newsletter-text">
          <h2>Subscribe Newsletter</h2>
          <p>I will update good news and promotion service not spam</p>
        </div>
        <div className="newsletter-input">
          <input type="email" placeholder="Enter your email address.." />
          <button>Contact Now</button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeNewsletter;
