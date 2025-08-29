import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/classes.css';
import class9 from '../assets/images/class 9.png';
import class10 from '../assets/images/class 10.png';
import class11 from '../assets/images/class 11.png';
import class12 from '../assets/images/class 12.png';
import grammar from '../assets/images/grammar.png';

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { fireStore } from '../config/firebase';
import { Spinner, Container, Row } from 'react-bootstrap';
import { RecentPostsSection } from './recentpost'; // 👈 Update this path if necessary

const RECENT_POSTS_LIMIT = 9;

const createSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();

const FeaturedClasses = () => {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const handleCardClick = (className) => {
    // Normalize class name if needed (e.g., replace spaces)
    navigate(`/notes/${className.toLowerCase().replace(" ", "")}`);
  };

  // 🔄 Fetch recent posts from Firebase
  const fetchRecentPosts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fireStore, 'topics'),
          orderBy('timestamp', 'desc'),
          limit(RECENT_POSTS_LIMIT)
        )
      );

      const posts = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let imageUrl = '';

          if (data.imageUrl) {
            imageUrl = data.imageUrl;
          } else {
            try {
              const imagesRef = collection(fireStore, `topics/${doc.id}/images`);
              const imagesSnapshot = await getDocs(imagesRef);
              if (!imagesSnapshot.empty) {
                const firstImage = imagesSnapshot.docs[0].data();
                imageUrl = firstImage.url || '';
              }
            } catch (imageError) {
              console.error('Image fetch error:', imageError);
            }
          }

          return {
            ...data,
            timestamp: data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null,
            topicId: doc.id,
            imageUrl,
            slug: createSlug(data.topic),
          };
        })
      ).then((posts) => posts.filter((post) => post.topic));

      setRecentPosts(posts);
    } catch (err) {
      console.error('Error fetching recent posts:', err);
      setError('Failed to load recent posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentPosts();
  }, [fetchRecentPosts]);

  return (
    <section className="featured-section">
      <div className="featured-container">
        {/* Featured Classes Heading & Description */}
        <div className="top-text-center">
          <div className="heading-wrapper">
            <h2 className="section-heading">Featured Classes</h2>
            <div className="gradient-underline"></div>
          </div>
          <p className="description">
            Explore expertly crafted courses, tailored content, and interactive tools to empower your learning journey online.
            Unlock your potential with immersive lessons, real-world applications, and a community that grows with you.
          </p>
           <p className="description text-center text-danger">
            Click here to explore notes, past papers, guess papers, and MCQ tests for each class.
          </p>
        </div>

        {/* Cards in a Row */}
        <div className="horizontal-card-container">
          <div className="class-card" onClick={() => handleCardClick("9")}>
            <img src={class9} alt="Class 9" className="class-image" />
            <h3>Class 9</h3>
            <ul>
              <li>Notes</li>
              <li>Past Papers</li>
              <li>Guess Papers</li>
              <li>MCQs Test</li>
            </ul>
          </div>

          <div className="class-card" onClick={() => handleCardClick("10")}>
            <img src={class10} alt="Class 10" className="class-image" />
            <h3>Class 10</h3>
            <ul>
              <li>Notes</li>
              <li>Past Papers</li>
              <li>Guess Papers</li>
              <li>MCQs Test</li>
            </ul>
          </div>

          <div className="class-card" onClick={() => handleCardClick("11")}>
            <img src={class11} alt="Class 11" className="class-image" />
            <h3>Class 11</h3>
            <ul>
              <li>Notes</li>
              <li>Past Papers</li>
              <li>Guess Papers</li>
              <li>MCQs Test</li>
            </ul>
          </div>
          

          <div className="class-card" onClick={() => handleCardClick("12")}>
            <img src={class12} alt="Class 12" className="class-image" />
            <h3>Class 12</h3>
            <ul>
              <li>Notes</li>
              <li>Past Papers</li>
              <li>Guess Papers</li>
              <li>MCQs Test</li>
            </ul>
          </div>

           <div className="class-card" onClick={() => handleCardClick("grammar")}>
            <img src={grammar} alt="Class 12" className="class-image" />
            <h3>Grammar</h3>
            <ul>
              <li>Letter</li>
              <li>Application</li>
              <li>Moral Stories</li>
              <li>Translation</li>
            </ul>
          </div>
        </div>
        

        {/* 🔽 Recents Section (Placeholder) */}
        <div className="recent-section">
          <div className="heading-wrapper">
            <h2 className="section-heading">Recent Posts</h2>
            <div className="gradient-underline"></div>
          </div>
          <p className="description">
            Discover the most recently added content across all classes and topics.
          </p>

          {loading ? (
            <Container className="my-4 text-center">
              <Spinner animation="border" variant="primary" />
            </Container>
          ) : error ? (
            <Container className="my-4 text-center text-danger">
              {error}
            </Container>
          ) : (
            <RecentPostsSection recentPosts={recentPosts} loading={false} error={null} />
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedClasses;
