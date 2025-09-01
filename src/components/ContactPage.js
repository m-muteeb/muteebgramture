import React, { useEffect } from "react"; // <-- import useEffect
import "../assets/css/contactpage.css"; // Ensure this path is correct


const ContactSection = () => {
 
      useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  return (
    <div className="container contactForm mt-5">
      <div className="row">
        <div className="col-md-6 mt-5">
          <h1 style={{ fontFamily: "Playfair-Display", fontSize: "35px" }}>How To Find Us</h1>
          <p className="mt-4 text-dark" style={{ color: "#767676" }}>
          Get in touch to explore how we can support your learning journey. Whether you have questions about our programs, just want to learn more, feel free to give us a call, send us an email, or fill out the contact form — we’re here to help.
          </p>
          <p style={{ color: "#000000" }}>
            <a href="tel:0303-6660025" style={{ textDecoration: "none" }}>
             0303-6660025
            </a>
          </p>
          {/* <p className="mt-2" style={{ color: "#000000" }}>
            Main shop Jia Musa Shahdara Lahore, Pakistan , 54950
          </p> */}
          <p>
            <a href="mailto:theambitious.edu@gmail.com" style={{ textDecoration: "underline", color: "#1d3557" }}>
              gramture.@gmail.com
            </a>
          </p>
        </div>
        <div className="col-md-6 mt-3">
          <h1 style={{ fontFamily: "Playfair-Display", fontSize: "35px" }}>Contact Us</h1>
          <p className="mt-4 text-dark" style={{ color: "#767676" }}>
            Your email address will not be published.
          </p>
          <form  className="contactform">
            <div className="row">
              <div className="form-group col-md-6 mb-2">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Your Name *"
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Your Email *"
                  required
                />
              </div>
            </div>
            <div className="form-group mt-2 ">
              <input
                type="text"
                name="website"
                className="form-control"
                placeholder="Your Website"
               
              />
            </div>
            <div className="form-group mt-3">
              <textarea
                name="message"
                className="form-control"
                rows="4"
                placeholder="Message..."
               
                required
              ></textarea>
            </div>
            <div className="btn-container mt-3">
              <button className="btn4" type="submit">Get In Touch</button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default ContactSection;
