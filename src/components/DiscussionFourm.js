import React, { useState, useEffect } from 'react';
import { FaImage, FaReply, FaRegCommentDots, FaGavel, FaUsers, FaTimes } from 'react-icons/fa';
import { message, Modal, Input, Button, Spin, Tooltip, Card, Avatar } from 'antd';
import { collection, addDoc, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { fireStore } from '../config/firebase';
import '../assets/css/discussion-forum.css';
const { TextArea } = Input;

const DiscussionForum = () => {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(fireStore, 'questions'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(questionsData);
    };

    fetchQuestions();
  }, []);

  const submitQuestion = async () => {
    if (question && name && email && topic) {
      setLoading(true);
      try {
        const newQuestion = {
          question,
          name,
          email,
          topic,
          replies: [],
          image: image || null,
          timestamp: new Date(),
        };

        const docRef = await addDoc(collection(fireStore, 'questions'), newQuestion);
        setQuestions([{ id: docRef.id, ...newQuestion }, ...questions]);
        setQuestion('');
        setName('');
        setEmail('');
        setTopic('');
        setImage(null);
        message.success('Your question has been posted!');
      } catch (e) {
        message.error('Error posting question');
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Please fill in all fields');
    }
  };

  const submitReply = async () => {
    if (!replyText || !name || !email) {
      message.error('Please fill in all fields before submitting.');
      return;
    }

    setLoadingReply(true);

    try {
      const newReply = {
        reply: replyText,
        name,
        email,
        image: image || null,
        timestamp: new Date(),
      };

      const questionRef = doc(fireStore, 'questions', currentQuestionId);
      const questionToUpdate = questions.find((q) => q.id === currentQuestionId);
      
      await updateDoc(questionRef, {
        replies: [...questionToUpdate.replies, newReply],
      });

      setQuestions(
        questions.map((item) =>
          item.id === currentQuestionId
            ? { ...item, replies: [...item.replies, newReply] }
            : item
        )
      );

      setModalVisible(false);
      setReplyText('');
      setImage(null);
      message.success('Reply posted!');
    } catch (e) {
      message.error('Error posting reply');
      console.error(e);
    } finally {
      setLoadingReply(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        message.error('File size must be less than 5MB');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const openReplyModal = (questionId) => {
    setCurrentQuestionId(questionId);
    setModalVisible(true);
  };

  const removeImage = () => {
    setImage(null);
  };

  // Function to correctly format Firestore timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    try {
      // Check if timestamp is a Firestore timestamp object
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      
      // Check if it's a regular Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      
      // Try to parse as a date string
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  const filteredQuestions = activeTab === 'all' 
    ? questions 
    : questions.filter(q => q.topic && q.topic.toLowerCase() === activeTab.toLowerCase());

  const uniqueTopics = [...new Set(questions.map(q => q.topic).filter(Boolean))];

  return (
    <div className="discussion-forum-container mt-5">
      <div className="forum-content">
        {/* Header */}
        <div className="forum-header">
          <h1 className="forum-title">
            <span className="forum-icon mt-5"></span> Gramture Discussion Forum
          </h1>
          <p className="forum-description">
            Ask questions, share knowledge, and grow together with our language learning community! 🌱
          </p>
        </div>

        <div className="forum-layout">
          {/* Main Content */}
          <div className="forum-main">
            {/* Ask a Question */}
            <Card className="ask-question-card" id="ask-question">
              <h2>Ask a New Question</h2>
              <div className="form-container">
                <div className="form-row">
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                  <Input
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
                <Input
                  placeholder="Topic (e.g., Tenses, Articles, Vocabulary)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="form-input"
                />
                <TextArea
                  placeholder="Write your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="form-textarea"
                  rows={4}
                />
                <div className="upload-section">
                  <div className="file-upload">
                    <label htmlFor="question-image" className="upload-btn">
                      <FaImage /> {image ? 'Change Image' : 'Upload Image'}
                    </label>
                    <input
                      type="file"
                      id="question-image"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    {image && (
                      <div className="image-preview">
                        <img src={image} alt="Preview" />
                        <button onClick={removeImage} className="remove-image">
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={submitQuestion}
                    loading={loading}
                    className="submit-button"
                    size="large"
                  >
                    Post Question
                  </Button>
                </div>
              </div>
            </Card>

            {/* Questions Filter */}
            <div className="questions-filter">
              <Button 
                type={activeTab === 'all' ? 'primary' : 'default'} 
                onClick={() => setActiveTab('all')}
              >
                All Questions
              </Button>
              {uniqueTopics.map(topic => (
                <Button 
                  key={topic}
                  type={activeTab === topic ? 'primary' : 'default'} 
                  onClick={() => setActiveTab(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>

            {/* Questions List */}
            <div className="questions-list">
              <h2 className="section-title">
                Community Questions {filteredQuestions.length > 0 && `(${filteredQuestions.length})`}
              </h2>
              
              {filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <FaRegCommentDots size={48} />
                  <h3>No questions yet</h3>
                  <p>Be the first to ask a question about {activeTab !== 'all' ? activeTab : 'English grammar'}!</p>
                  <Button type="primary" onClick={() => document.getElementById('ask-question').scrollIntoView({ behavior: 'smooth' })}>
                    Ask a Question
                  </Button>
                </div>
              ) : (
                filteredQuestions.map((item) => (
                  <Card key={item.id} className="question-card">
                    <div className="question-header">
                      <div className="user-info">
                        <Avatar size="large" className="user-avatar">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <div className="user-details">
                          <h3>{item.name || 'Unknown User'}</h3>
                          <span className="post-time">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                      </div>
                      {item.topic && (
                        <span className="topic-tag">{item.topic}</span>
                      )}
                    </div>
                    
                    <p className="question-text">{item.question}</p>
                    
                    {item.image && (
                      <div className="image-preview">
                        <img src={item.image} alt="question attachment" />
                      </div>
                    )}

                    <div className="question-actions">
                      <Tooltip title="Reply to this question">
                        <Button
                          type="text"
                          onClick={() => openReplyModal(item.id)}
                          icon={<FaReply />}
                        >
                          Reply
                        </Button>
                      </Tooltip>
                      <Button
                        type="text"
                        onClick={() => setExpandedQuestion(expandedQuestion === item.id ? null : item.id)}
                      >
                        {expandedQuestion === item.id ? 'Hide Replies' : `Show Replies (${item.replies ? item.replies.length : 0})`}
                      </Button>
                    </div>

                    {(expandedQuestion === item.id || (item.replies && item.replies.length === 1)) && item.replies && item.replies.length > 0 && (
                      <div className="replies-section">
                        <h4><FaRegCommentDots /> Replies</h4>
                        {item.replies.map((reply, index) => (
                          <div key={index} className="reply-card">
                            <div className="reply-header">
                              <Avatar size="small" className="reply-avatar">
                                {reply.name ? reply.name.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              <div className="reply-author">
                                <strong>{reply.name || 'Unknown User'}</strong>
                                <span className="reply-time">
                                  {formatDate(reply.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className="reply-text">{reply.reply}</p>
                            {reply.image && (
                              <div className="image-preview small">
                                <img src={reply.image} alt="reply attachment" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="forum-sidebar">
            {/* Forum Rules */}
            <Card className="sidebar-card" title={<><FaGavel /> Forum Rules</>}>
              <ul className="rules-list">
                <li>
                  <FaUsers className="rule-icon" />
                  <div className="rule-content">
                    <strong>Be Respectful:</strong> Treat everyone with kindness and respect.
                  </div>
                </li>
                <li>
                  <FaGavel className="rule-icon" />
                  <div className="rule-content">
                    <strong>No Spam:</strong> Promotional content or irrelevant links are not allowed.
                  </div>
                </li>
                <li>
                  <FaRegCommentDots className="rule-icon" />
                  <div className="rule-content">
                    <strong>Stay On Topic:</strong> Make sure your replies contribute to the discussion.
                  </div>
                </li>
                <li>
                  <FaImage className="rule-icon" />
                  <div className="rule-content">
                    <strong>Responsible Media Use:</strong> Only upload relevant and respectful images.
                  </div>
                </li>
                <li>
                  <FaReply className="rule-icon" />
                  <div className="rule-content">
                    <strong>Use Reply Feature:</strong> Use the reply button to respond to questions.
                  </div>
                </li>
              </ul>
            </Card>

            {/* Popular Topics */}
            <Card className="sidebar-card" title="Popular Topics">
              <div className="topics-list">
                {uniqueTopics.slice(0, 5).map(topic => (
                  <div key={topic} className="topic-item">
                    <span className="topic-name">{topic}</span>
                    <span className="topic-count">
                      ({questions.filter(q => q.topic === topic).length})
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats */}
            <Card className="sidebar-card" title="Forum Statistics">
              <div className="stats-item">
                <span className="stats-label">Total Questions:</span>
                <span className="stats-value">{questions.length}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">Total Replies:</span>
                <span className="stats-value">
                  {questions.reduce((acc, curr) => acc + (curr.replies ? curr.replies.length : 0), 0)}
                </span>
              </div>
              <div className="stats-item">
                <span className="stats-label">Active Users:</span>
                <span className="stats-value">
                  {new Set(
                    questions.map(q => q.email).filter(Boolean).concat(
                      ...questions.map(q => 
                        q.replies ? q.replies.map(r => r.email).filter(Boolean) : []
                      )
                    )
                  ).size}
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal for Reply */}
        <Modal
          title="Post a Reply"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setImage(null);
          }}
          footer={null}
          className="reply-modal"
        >
          <div className="form-container">
            <div className="form-row">
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
              <Input
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <TextArea
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="form-textarea"
              rows={4}
            />
            <div className="upload-section">
              <div className="file-upload">
                <label htmlFor="reply-image" className="upload-btn">
                  <FaImage /> {image ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id="reply-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {image && (
                  <div className="image-preview">
                    <img src={image} alt="Preview" />
                    <button onClick={removeImage} className="remove-image">
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
              <Button
                type="primary"
                onClick={submitReply}
                loading={loadingReply}
                className="submit-button"
                size="large"
              >
                Post Reply
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DiscussionForum;