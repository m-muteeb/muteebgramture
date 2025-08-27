import React from 'react';
import '../assets/css/ourtrack.css';
import TestPrep from '../assets/images/t4.jpg';
import Personal from '../assets/images/t1.jpg';
import Leadership from '../assets/images/past ppr.jpg';

export default function Project() {
  const tracks = [
    {
      title: "Notes & Test Preparation",
      description: "Master your exams with our comprehensive test preparation resources, designed to boost your confidence.",
      image: TestPrep,
    },
    {
      title: "Grammar Portion",
      description: "Covers communication skills, leadership, time management, productivity, and career development.",
      image: Personal,
    },
    {
      title: "MCQs tests & Past Papers",
      description: "Focuses on decision-making, emotional intelligence, and team-building skills to develop effective leaders.",
      image: Leadership,
    },
  ];

  return (
    <section className="track-wrapper">
      <div className="track-inner-container">
        <div className="track-header">
          <h2 className="track-title">Our Tracks</h2>
          <div className="track-underline"></div>
          <p className="track-subtitle">
            Unlock limitless learning opportunities with our expertly curated tracks, designed to empower you with knowledge and skills for success.
          </p>
        </div>

        <div className="track-card-container">
          {tracks.map((track, index) => (
            <div className="track-card" key={index}>
              <img src={track.image} alt={track.title} className="track-card-image" />
              <div className="track-card-content">
                <h3 className="track-card-title">{track.title}</h3>
                <p className="track-card-description">{track.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}









