import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, orderBy, query, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../config/firebase';
import LoginRegisterPage from './LoginRegister';

const ToppersWall = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const [toppers, setToppers] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchToppers = async () => {
      try {
        const toppersQuery = query(
          collection(db, 'toppers'),
          orderBy('score', 'desc')
        );
        
        const toppersSnapshot = await getDocs(toppersQuery);
        const allToppers = toppersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || 0,
          likedBy: doc.data().likedBy || [],
          commentCount: doc.data().commentCount || 0
        }));
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const dailyToppers = allToppers.filter(topper => {
          const topperDate = new Date(topper.lastUpdated);
          return topperDate >= oneDayAgo;
        });
        
        const weeklyToppers = allToppers.filter(topper => {
          const topperDate = new Date(topper.lastUpdated);
          return topperDate >= oneWeekAgo;
        });
        
        const monthlyToppers = allToppers.filter(topper => {
          const topperDate = new Date(topper.lastUpdated);
          return topperDate >= oneMonthAgo;
        });
        
        setToppers({
          daily: dailyToppers,
          weekly: weeklyToppers,
          monthly: monthlyToppers
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching toppers: ", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchToppers();
  }, []);

  const updateTopper = (topperId, updates) => {
    setToppers(prev => {
      const updateCat = cat => cat.map(t => t.id === topperId ? { ...t, ...updates } : t);
      return {
        daily: updateCat(prev.daily),
        weekly: updateCat(prev.weekly),
        monthly: updateCat(prev.monthly)
      };
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Excellence Hall of Fame...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>Connection Issue: {error}</p>
        <p style={styles.errorSubtext}>Please check your connection and try again</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h1 style={styles.mainTitle}>Academic Excellence</h1>
          <div style={styles.titleUnderline}></div>
        </div>
        <p style={styles.subtitle}>Celebrating outstanding achievements and academic success</p>
        <div style={styles.authContainer}>
          {user ? (
            <button onClick={() => signOut(auth)} style={styles.logoutButton}>
              Logout
            </button>
          ) : (
            <button onClick={() => setShowModal(true)} style={styles.loginButton}>
              Login 
            </button>
          )}
        </div>
      </div>
      
      <div style={styles.tabContainer}>
        <button 
          style={{...styles.tab, ...(activeTab === 'daily' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('daily')}
        >
          <span style={styles.tabIcon}>Today</span>
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'weekly' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('weekly')}
        >
          <span style={styles.tabIcon}>Week</span>
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'monthly' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('monthly')}
        >
          <span style={styles.tabIcon}>Month</span>
        </button>
      </div>

      <div style={styles.authBelowTabs}>
        {user ? (
          <button onClick={() => signOut(auth)} style={styles.logoutButton}>
            Logout
          </button>
        ) : (
          <button onClick={() => setShowModal(true)} style={styles.loginButton}>
            Login to become part of Gramture
          </button>
        )}
      </div>

      <div style={styles.content}>
        {activeTab === 'daily' && (
          <TopperSection 
            toppers={toppers.daily} 
            title="Today's Top Performers" 
            period="daily" 
            user={user}
            setShowModal={setShowModal}
            updateTopper={updateTopper}
            db={db}
          />
        )}
        {activeTab === 'weekly' && (
          <TopperSection 
            toppers={toppers.weekly} 
            title="This Week's Achievers" 
            period="weekly" 
            user={user}
            setShowModal={setShowModal}
            updateTopper={updateTopper}
            db={db}
          />
        )}
        {activeTab === 'monthly' && (
          <TopperSection 
            toppers={toppers.monthly} 
            title="Monthly Excellence" 
            period="monthly" 
            user={user}
            setShowModal={setShowModal}
            updateTopper={updateTopper}
            db={db}
          />
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <LoginRegisterPage onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const TopperSection = ({ toppers, title, period, user, setShowModal, updateTopper, db }) => {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.sectionCount}>
          {toppers.length} {toppers.length === 1 ? 'Student' : 'Students'}
        </div>
      </div>
      <TopperList toppers={toppers} period={period} user={user} setShowModal={setShowModal} updateTopper={updateTopper} db={db} />
    </section>
  );
};

const TopperList = ({ toppers, period, user, setShowModal, updateTopper, db }) => {
  if (toppers.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📊</div>
        <p style={styles.emptyText}>No records yet</p>
        <p style={styles.emptySubtext}>Be the first to make your mark!</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {toppers.map((topper, index) => (
        <TopperCard 
          key={topper.id} 
          topper={topper} 
          rank={index + 1} 
          period={period} 
          user={user} 
          setShowModal={setShowModal} 
          updateTopper={updateTopper} 
          db={db} 
        />
      ))}
    </div>
  );
};

const TopperCard = ({ topper, rank, period, user, setShowModal, updateTopper, db }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const getRankStyle = (rank) => {
    if (rank === 1) return styles.goldRank;
    if (rank === 2) return styles.silverRank;
    if (rank === 3) return styles.bronzeRank;
    return styles.standardRank;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return { emoji: '🥇', label: 'First Place' };
    if (rank === 2) return { emoji: '🥈', label: 'Second Place' };
    if (rank === 3) return { emoji: '🥉', label: 'Third Place' };
    return { emoji: rank, label: `Rank ${rank}` };
  };

  const rankInfo = getRankIcon(rank);
  const accuracy = topper.totalQuestions ? Math.round((topper.score / topper.totalQuestions) * 100) : 0;
  const isLiked = user && topper.likedBy.includes(user.uid);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const commentsQuery = query(
        collection(db, `toppers/${topper.id}/comments`),
        orderBy('timestamp', 'desc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching comments: ", err);
    }
    setLoadingComments(false);
  };

  const handleLike = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    if (isLiked) return; // Assuming no unlike, as per original
    try {
      const topperRef = doc(db, 'toppers', topper.id);
      await updateDoc(topperRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid)
      });
      updateTopper(topper.id, {
        likes: topper.likes + 1,
        likedBy: [...topper.likedBy, user.uid]
      });
    } catch (err) {
      console.error("Error liking topper: ", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText || !user) return;
    try {
      const commentRef = await addDoc(collection(db, `toppers/${topper.id}/comments`), {
        text: commentText,
        userName: user.displayName || user.email.split('@')[0],
        uid: user.uid,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'toppers', topper.id), {
        commentCount: increment(1)
      });
      updateTopper(topper.id, { commentCount: topper.commentCount + 1 });
      setCommentText('');
      fetchComments();
    } catch (err) {
      console.error("Error adding comment: ", err);
    }
  };

  return (
    <div 
      style={{ 
        ...styles.card, 
        ...getRankStyle(rank),
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.rankContainer}>
          <div style={styles.rankBadge}>
            <span style={styles.rankText} aria-label={rankInfo.label}>
              {rankInfo.emoji}
            </span>
          </div>
        </div>
        
        <div style={styles.accuracyContainer}>
          <span style={styles.accuracyValue}>{accuracy}%</span>
          <span style={styles.accuracyLabel}>accuracy</span>
        </div>
      </div>
      
      <div style={styles.cardBody}>
        <h3 style={styles.name}>{topper.name || "Student"}</h3>
        <p style={styles.class}>Class {topper.class || "X"}</p>
        
        <div style={styles.scoreDisplay}>
          <div style={styles.scoreText}>
            <span style={styles.scoreValue}>{topper.score || 0}</span>
            <span style={styles.scoreDivider}>/</span>
            <span style={styles.totalQuestions}>{topper.totalQuestions || 10}</span>
          </div>
        </div>
        
        <div style={styles.topicContainer}>
          <span style={styles.topicValue}>{topper.topic || "General Knowledge"}</span>
        </div>

        <div style={styles.attemptsContainer}>
          <span style={styles.attemptsText}>{topper.totalAttempts || 1} attempt{topper.totalAttempts !== 1 ? 's' : ''}</span>
        </div>

        <div style={styles.interactionsContainer}>
          <div style={styles.actionButtons}>
            <button 
              style={{
                ...styles.likeButton,
                ...(isLiked ? styles.likedButton : {})
              }} 
              onClick={handleLike}
              disabled={isLiked}
            >
              <span style={styles.buttonIcon}>👍</span>
              <span style={styles.buttonCount}>{topper.likes}</span>
            </button>
            <button 
              style={styles.commentButton} 
              onClick={() => setShowComments(!showComments)}
            >
              <span style={styles.buttonIcon}>💬</span>
              <span style={styles.buttonCount}>{topper.commentCount}</span>
            </button>
          </div>
        </div>

        {showComments && (
          <div style={styles.commentsSection}>
            <div style={styles.commentsHeader}>
              <h4 style={styles.commentsTitle}>Comments</h4>
              <button 
                style={styles.closeCommentsButton}
                onClick={() => setShowComments(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.commentsList}>
              {loadingComments ? (
                <div style={styles.loadingCommentsContainer}>
                  <div style={styles.smallSpinner}></div>
                  <p style={styles.loadingCommentsText}>Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p style={styles.noComments}>No comments yet. Be the first to share your thoughts!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} style={styles.comment}>
                    <div style={styles.commentHeader}>
                      <strong style={styles.commentUser}>{comment.userName}</strong>
                      <span style={styles.commentTime}>
                        {comment.timestamp?.toDate ? new Date(comment.timestamp.toDate()).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <p style={styles.commentText}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            
            {user ? (
              <div style={styles.addCommentContainer}>
                <div style={styles.commentInputContainer}>
                  <textarea 
                    style={styles.commentInput}
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder="Share your appreciation or ask a question..." 
                    rows="2"
                  />
                </div>
                <div style={styles.commentActions}>
                  <button 
                    style={{
                      ...styles.postCommentButton,
                      ...(commentText.length === 0 ? styles.postCommentButtonDisabled : {})
                    }} 
                    onClick={handleAddComment}
                    disabled={commentText.length === 0}
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            ) : (
              <p 
                style={styles.loginToComment} 
                onClick={() => setShowModal(true)}
              >
                Login to add a comment
              </p>
            )}
          </div>
        )}
      </div>
      
      <div style={styles.cardFooter}>
        <div style={styles.periodBadge}>
          {period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month'}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '16px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    padding: '32px 16px 16px',
    position: 'relative',
  },
  titleContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '12px',
  },
  mainTitle: {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
    marginTop: '50px'
  },
  titleUnderline: {
    height: '3px',
    width: '50px',
    backgroundColor: '#4a5568',
    margin: '0 auto',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.1rem)',
    color: '#718096',
    margin: '0',
    fontWeight: '400',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  authContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },
  authBelowTabs: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  loginButton: {
    padding: '8px 16px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'white',
    color: '#4a5568',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    minWidth: '80px',
  },
  activeTab: {
    backgroundColor: '#2d3748',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  tabIcon: {
    fontSize: '14px',
  },
  content: {
    marginBottom: '32px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0',
  },
  sectionCount: {
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  goldRank: {
    borderTop: '3px solid #d69e2e',
  },
  silverRank: {
    borderTop: '3px solid #a0aec0',
  },
  bronzeRank: {
    borderTop: '3px solid #ed8936',
  },
  standardRank: {
    borderTop: '3px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  rankContainer: {
    position: 'relative',
  },
  rankBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    display: 'inline-block',
  },
  rankText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2d3748',
  },
  accuracyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  accuracyValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#38a169',
  },
  accuracyLabel: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: '16px',
    textAlign: 'center',
  },
  name: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 4px 0',
  },
  class: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 16px 0',
  },
  scoreDisplay: {
    marginBottom: '16px',
  },
  scoreText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '4px',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
  },
  scoreDivider: {
    fontSize: '18px',
    color: '#cbd5e0',
    fontWeight: '500',
  },
  totalQuestions: {
    fontSize: '16px',
    color: '#718096',
    fontWeight: '500',
  },
  topicContainer: {
    marginBottom: '12px',
  },
  topicValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    fontStyle: 'italic',
  },
  attemptsContainer: {
    marginBottom: '12px',
  },
  attemptsText: {
    fontSize: '14px',
    color: '#718096',
  },
  interactionsContainer: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '8px',
  },
  likeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  likedButton: {
    backgroundColor: '#ebf8ff',
    color: '#3182ce',
    borderColor: '#bee3f8',
  },
  commentButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  buttonIcon: {
    fontSize: '16px',
  },
  buttonCount: {
    fontSize: '14px',
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  commentsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  commentsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  closeCommentsButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#718096',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  commentsList: {
    maxHeight: '200px',
    overflowY: 'auto',
    marginBottom: '16px',
    paddingRight: '8px',
  },
  comment: {
    padding: '12px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #edf2f7',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  commentUser: {
    fontSize: '14px',
    color: '#2d3748',
  },
  commentTime: {
    fontSize: '12px',
    color: '#718096',
  },
  commentText: {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    lineHeight: '1.4',
  },
  addCommentContainer: {
    marginTop: '16px',
  },
  commentInputContainer: {
    marginBottom: '12px',
  },
  commentInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  commentActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  postCommentButton: {
    padding: '8px 16px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  postCommentButtonDisabled: {
    backgroundColor: '#cbd5e0',
    cursor: 'not-allowed',
  },
  loginToComment: {
    textAlign: 'center',
    color: '#4299e1',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    marginTop: '12px',
  },
  loadingCommentsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  smallSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #e2e8f0',
    borderTop: '2px solid #4299e1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '8px',
  },
  loadingCommentsText: {
    fontSize: '14px',
    color: '#718096',
  },
  noComments: {
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: '14px',
    padding: '20px',
    fontStyle: 'italic',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  periodBadge: {
    backgroundColor: '#ebf8ff',
    color: '#3182ce',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#a0aec0',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    opacity: '0.5',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    margin: '0',
    opacity: '0.7',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #4a5568',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#718096',
    fontWeight: '500',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    padding: '20px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  errorSubtext: {
    color: '#718096',
    fontSize: '14px',
    margin: '0',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    maxWidth: '400px',
    width: '100%',
  },
};

// Add the animation to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}

// Media queries for responsiveness
const mediaQueries = `
  @media (max-width: 768px) {
    .container {
      padding: '12px';
    }
    
    .header {
      padding: '24px 12px 12px';
      marginBottom: '24px';
    }
    
    .section {
      padding: '20px 16px';
      marginBottom: '20px';
    }
    
    .list {
      grid-template-columns: '1fr';
      gap: '16px';
    }
    
    .card {
      padding: '16px';
    }
    
    .tab {
      padding: '10px 16px';
      font-size: '13px';
      min-width: '70px';
    }
    
    .section-header {
      flex-direction: 'column';
      align-items: 'flex-start';
      gap: '8px';
    }
  }
  
  @media (max-width: 480px) {
    .tab-container {
      flex-direction: 'column';
      align-items: 'stretch';
    }
    
    .tab {
      width: '100%';
      margin-bottom: '8px';
    }
  }
`;

// Add media queries to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mediaQueries;
  document.head.appendChild(style);
}

export default ToppersWall;