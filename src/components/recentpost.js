import React, { memo, useState, useEffect } from 'react';
import { Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/300x200?text=No+Image';

export const RecentPostCard = memo(({ post }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (post.featuredImage) {
          // If image is already a URL (from draft or direct URL)
          if (post.featuredImage.startsWith('http')) {
            setImageUrl(post.featuredImage);
          } else {
            // If it's a Firebase storage reference
            const url = await getDownloadURL(ref(storage, post.featuredImage));
            setImageUrl(url);
          }
        } else if (post.imageUrl) {
          setImageUrl(post.imageUrl);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(DEFAULT_IMAGE_URL);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [post.featuredImage, post.imageUrl]);

  return (
    <Col xs={12} sm={6} md={4} lg={4} className="mb-4">
      <Link
        to={`/description/${post.subCategory}/${post.slug}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Card className="shadow-sm border-0 rounded-lg h-100" style={{ backgroundColor: '#f8f9fa' }}>
          {/* Image section with lazy loading */}
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
            {(loadingImage || !imageLoaded) && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0'
              }}>
                <Spinner animation="border" size="sm" variant="secondary" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={post.topic}
              className="card-img-top"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: imageLoaded && !loadingImage ? 'block' : 'none'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE_URL;
                setImageLoaded(true);
              }}
              loading="lazy"
            />
          </div>
          <Card.Body>
            <h5 className="text-danger">{post.topic}</h5>
            <p className="text-muted">
              {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'No date'}
            </p>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
});

RecentPostCard.propTypes = {
  post: PropTypes.shape({
    topic: PropTypes.string.isRequired,
    subCategory: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object // Firestore timestamp
    ]),
    imageUrl: PropTypes.string,
    featuredImage: PropTypes.string,
  }).isRequired,
};

export const RecentPostsSection = memo(({ recentPosts, loading, error }) => {
 if (loading) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff' // Optional: white background while loading
      }}
    >
      <Spinner animation="border" size="lg" variant="primary" />
    </div>
  );
}

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* <h1 className="text-xl mb-4 text-center mt-4">Recent Posts</h1> */}
      <div className="row justify-content-center mt-4">
        {recentPosts.length > 0 ? (
          recentPosts.map((post, index) => (
            <RecentPostCard key={index} post={post} />
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No recent posts available.</p>
          </div>
        )}
      </div>
    </>
  );
});

RecentPostsSection.propTypes = {
  recentPosts: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};