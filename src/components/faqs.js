import React, { useState, useEffect } from "react";
import '../assets/css/faqs.css'; // Make sure this path is correct

const faqsData = [
    {
        question: "How can I access English notes of all classes?",
        answer:
            "First, go to the 'Classes' section, then select your desired category and subcategory. Finally, you'll find all the available English notes organized by class and type.",
    },
    {
        question: "How can I purchase your book?",
        answer:
            "You can purchase the book by either visiting our main office or authorized sole distributor. Alternatively, you can make an online payment and have the book delivered to your address.",
    },
    {
        question: "How can I give an MCQ test?",
        answer:
            "Go to the 'MCQ Selection' section, choose your desired chapter or section, and then click to start the test. The MCQs for that topic will appear immediately.",
    },
    {
        question: "Is Gramture free to use or do I need a subscription?",
        answer:
            "Gramture is completely free to use! All English notes, MCQs, past papers, and educational resources are accessible without any charges. Our goal is to make quality education available to everyone.",
    },
];

const Faqs = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="faq-container mb-4">
            <h2 className="faq-heading mt-4">Frequently Asked Questions</h2>
            <div className="faq-list">
                {faqsData.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className="faq-question">
                            {faq.question}
                            <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                        </div>
                        {activeIndex === index && (
                            <div className="faq-answer">{faq.answer}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;
