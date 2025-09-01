import React, { memo , useEffect } from 'react';
import { Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export const RecentPostCard = memo(({ post }) => {

    useEffect(() => {
          window.scrollTo(0, 0);
      }, []); 

  return (
    <Col xs={12} sm={6} md={4} lg={4} className="mb-4">
      <Link
        to={`/description/${post.subCategory}/${post.slug}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Card className="shadow-sm border-0 rounded-lg h-100" style={{ backgroundColor: '#f8f9fa' }}>
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
          backgroundColor: '#ffffff'
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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