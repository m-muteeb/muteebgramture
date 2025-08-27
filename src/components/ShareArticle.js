import React from 'react';
import { message } from 'antd';
import { FaShareAlt } from 'react-icons/fa';

const ShareArticle = () => {
  const handleShare = () => {
    if (typeof window !== 'undefined' && window.location) {
      const url = window.location.href;

      if (navigator.share) {
        navigator
          .share({
            title: 'Check out this article!',
            url,
          })
          .then(() => message.success('Article shared successfully!'))
          .catch(() => copyLinkToClipboard(url));
      } else {
        copyLinkToClipboard(url);
      }
    } else {
      message.error('Unable to get the current URL.');
    }
  };

  const copyLinkToClipboard = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => message.success('Link copied to clipboard!'))
        .catch(() => message.error('Failed to copy the link.'));
    } else {
      message.warning('Clipboard API not supported. Try a desktop browser.');
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleShare}>
        <FaShareAlt style={{ marginRight: '8px' }} /> Share Article
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '40px 0', // spacing from top and bottom
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1d72b8, #3399ff)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
};

export default ShareArticle;
