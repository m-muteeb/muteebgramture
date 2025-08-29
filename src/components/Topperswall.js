import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { app } from '../config/firebase';

const ToppersWall = () => {
  const db = getFirestore(app);
  const [toppers, setToppers] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

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
          ...doc.data()
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
          <h1 style={styles.mainTitle}>Excellence Hall of Fame</h1>
          <div style={styles.titleUnderline}></div>
        </div>
        <p style={styles.subtitle}>Celebrating academic excellence and outstanding achievements</p>
      </div>
      
      <div style={styles.tabContainer}>
        <button 
          style={{...styles.tab, ...(activeTab === 'daily' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('daily')}
        >
          <span style={styles.tabIcon}>🌞</span>
          Today's Stars
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'weekly' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('weekly')}
        >
          <span style={styles.tabIcon}>⭐</span>
          Weekly Achievers
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'monthly' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('monthly')}
        >
          <span style={styles.tabIcon}>🏆</span>
          Monthly Champions
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'daily' && (
          <TopperSection 
            toppers={toppers.daily} 
            title="Today's Academic Stars" 
            period="daily" 
          />
        )}
        {activeTab === 'weekly' && (
          <TopperSection 
            toppers={toppers.weekly} 
            title="This Week's Top Performers" 
            period="weekly" 
          />
        )}
        {activeTab === 'monthly' && (
          <TopperSection 
            toppers={toppers.monthly} 
            title="Monthly Excellence Champions" 
            period="monthly" 
          />
        )}
      </div>
    </div>
  );
};

const TopperSection = ({ toppers, title, period }) => {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.sectionCount}>
          {toppers.length} {toppers.length === 1 ? 'Achiever' : 'Achievers'}
        </div>
      </div>
      <TopperList toppers={toppers} period={period} />
    </section>
  );
};

const TopperList = ({ toppers, period }) => {
  if (toppers.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📊</div>
        <p style={styles.emptyText}>No achievements recorded yet</p>
        <p style={styles.emptySubtext}>Be the first to make your mark on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {toppers.map((topper, index) => (
        <TopperCard key={topper.id} topper={topper} rank={index + 1} period={period} />
      ))}
    </div>
  );
};

const TopperCard = ({ topper, rank, period }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRankStyle = (rank) => {
    if (rank === 1) return styles.goldRank;
    if (rank === 2) return styles.silverRank;
    if (rank === 3) return styles.bronzeRank;
    return styles.standardRank;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return { emoji: '🥇', label: 'Gold Medal' };
    if (rank === 2) return { emoji: '🥈', label: 'Silver Medal' };
    if (rank === 3) return { emoji: '🥉', label: 'Bronze Medal' };
    return { emoji: `#${rank}`, label: `Rank ${rank}` };
  };

  const rankInfo = getRankIcon(rank);
  const accuracy = topper.totalQuestions ? Math.round((topper.score / topper.totalQuestions) * 100) : 0;

  return (
    <div 
      style={{ 
        ...styles.card, 
        ...getRankStyle(rank),
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 25px rgba(0, 0, 0, 0.15)' : styles.card.boxShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.rankContainer}>
          <div style={styles.rankBadge}>
            <span style={styles.rankEmoji} aria-label={rankInfo.label}>
              {rankInfo.emoji}
            </span>
          </div>
          <div style={styles.medalEffect}></div>
        </div>
        
        <div style={styles.accuracyContainer}>
          <div style={styles.accuracyCircle}>
            <span style={styles.accuracyValue}>{accuracy}%</span>
          </div>
          <span style={styles.accuracyLabel}>Accuracy</span>
        </div>
      </div>
      
      <div style={styles.cardBody}>
        <h3 style={styles.name}>{topper.name || "Academic Star"}</h3>
        <p style={styles.class}>Class {topper.class || "X"}</p>
        
        <div style={styles.scoreDisplay}>
          <div style={styles.scoreBar}>
            <div 
              style={{ 
                ...styles.scoreProgress, 
                width: `${accuracy}%`,
                backgroundColor: accuracy >= 80 ? '#10B981' : accuracy >= 60 ? '#F59E0B' : '#EF4444'
              }} 
            />
          </div>
          <div style={styles.scoreText}>
            <span style={styles.scoreValue}>{topper.score || 0}</span>
            <span style={styles.scoreDivider}>/</span>
            <span style={styles.totalQuestions}>{topper.totalQuestions || 10}</span>
          </div>
        </div>
        
        <div style={styles.topicContainer}>
          <span style={styles.topicLabel}>Mastered Topic:</span>
          <span style={styles.topicValue}>{topper.topic || "General Knowledge"}</span>
        </div>

        <div style={styles.attemptsContainer}>
          <span style={styles.attemptsIcon}>📝</span>
          <span style={styles.attemptsText}>{topper.totalAttempts || 1} attempt{topper.totalAttempts !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div style={styles.cardFooter}>
        <div style={styles.periodBadge}>
          {period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month'}
        </div>
        <div style={styles.date}>
          {topper.lastUpdated ? new Date(topper.lastUpdated).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }) : ''}
        </div>
      </div>
      
      {rank <= 3 && (
        <div style={styles.cornerRibbon}>
          {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-Up' : 'Top Performer'}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
  
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '40px 20px 20px',
  },
  titleContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '12px',
  },
  mainTitle: {
    fontSize: '2.8rem',
    fontWeight: '800',
    color: '#1F2937',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
    marginTop: '20px',
  },
  titleUnderline: {
    height: '4px',
    width: '60px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    margin: '0 auto',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#6B7280',
    margin: '0',
    fontWeight: '400',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    gap: '12px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '50px',
    background: 'white',
    color: '#6B7280',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  tabIcon: {
    fontSize: '18px',
  },
  content: {
    marginBottom: '40px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #F3F4F6',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0',
  },
  sectionCount: {
    backgroundColor: '#EEF2FF',
    color: '#6366F1',
    fontSize: '14px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
    border: '1px solid #F3F4F6',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  goldRank: {
    borderTop: '4px solid #FFD700',
    background: 'linear-gradient(to bottom, #FFFFFF, #FFF9E6)',
  },
  silverRank: {
    borderTop: '4px solid #C0C0C0',
    background: 'linear-gradient(to bottom, #FFFFFF, #F8F8F8)',
  },
  bronzeRank: {
    borderTop: '4px solid #CD7F32',
    background: 'linear-gradient(to bottom, #FFFFFF, #FDF3E7)',
  },
  standardRank: {
    borderTop: '4px solid #E5E7EB',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  rankContainer: {
    position: 'relative',
  },
  rankBadge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    zIndex: '2',
    position: 'relative',
  },
  medalEffect: {
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    right: '-5px',
    bottom: '-5px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
    zIndex: '1',
  },
  rankEmoji: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  accuracyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  accuracyCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'conic-gradient(#10B981 0% var(--accuracy, 0%), #F3F4F6 var(--accuracy, 0%) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  accuracyValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#10B981',
  },
  accuracyLabel: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: '20px',
  },
  name: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0 0 6px 0',
    textAlign: 'center',
  },
  class: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 20px 0',
    textAlign: 'center',
  },
  scoreDisplay: {
    marginBottom: '20px',
  },
  scoreBar: {
    height: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  scoreText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '4px',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1F2937',
  },
  scoreDivider: {
    fontSize: '18px',
    color: '#D1D5DB',
    fontWeight: '600',
  },
  totalQuestions: {
    fontSize: '16px',
    color: '#6B7280',
    fontWeight: '600',
  },
  topicContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
  },
  topicLabel: {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '4px',
  },
  topicValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6366F1',
    textAlign: 'center',
  },
  attemptsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  attemptsIcon: {
    fontSize: '14px',
  },
  attemptsText: {
    fontSize: '14px',
    color: '#6B7280',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #F3F4F6',
  },
  periodBadge: {
    backgroundColor: '#EEF2FF',
    color: '#6366F1',
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '16px',
  },
  date: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  cornerRibbon: {
    position: 'absolute',
    top: '12px',
    right: '-20px',
    transform: 'rotate(45deg)',
    backgroundColor: '#FFD700',
    color: '#1F2937',
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 24px',
    width: '100px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9CA3AF',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5',
  },
  emptyText: {
    fontSize: '18px',
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
    height: '60vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #6366F1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    padding: '20px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorText: {
    color: '#EF4444',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  errorSubtext: {
    color: '#6B7280',
    fontSize: '14px',
    margin: '0',
  },
  '@media (max-width: 768px)': {
    container: {
      padding: '15px',
    },
    mainTitle: {
      fontSize: '2.2rem',
    },
    subtitle: {
      fontSize: '1rem',
    },
    tabContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    tab: {
      width: '100%',
      maxWidth: '280px',
      justifyContent: 'center',
    },
    section: {
      padding: '24px 16px',
    },
    list: {
      gridTemplateColumns: '1fr',
    },
    card: {
      padding: '20px',
    },
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

export default ToppersWall;