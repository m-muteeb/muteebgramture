import React, { useState, useEffect } from 'react';
import { FaImage, FaReply, FaRegCommentDots, FaGavel, FaUsers } from 'react-icons/fa';
import { message, Modal, Input, Button, Spin, Tooltip } from 'antd';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import '../assets/css/discussion-forum.css';

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(fireStore, 'questions'));
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
        };

        const docRef = await addDoc(collection(fireStore, 'questions'), newQuestion);
        setQuestions([...questions, { id: docRef.id, ...newQuestion }]);
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
      };

      const questionRef = doc(fireStore, 'questions', currentQuestionId);
      await updateDoc(questionRef, {
        replies: [
          ...questions.find((q) => q.id === currentQuestionId).replies,
          newReply,
        ],
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

  return (
    <div className="discussion-forum">

      {/* Header */}
      <div className="forum-header">
        <h1 className="forum-title">📢 Gramture Discussion Forum</h1>
        <p className="forum-description">
          Ask questions, share knowledge, and grow together! 🌱
        </p>
      </div>

      {/* Ask a Question */}
      <div className="ask-question">
        <h2>📝 Ask a New Question</h2>
        <div className="form-container">
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
          <Input
            placeholder="Topic (e.g. Tenses, Articles)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="form-input"
          />
          <textarea
            placeholder="Write your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="form-textarea"
          />
          <div className="file-upload">
            <label htmlFor="question-image">
              <FaImage size={20} /> Upload Image
            </label>
            <input
              type="file"
              id="question-image"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {image && <span>Image Selected</span>}
          </div>
          <Button
            type="primary"
            onClick={submitQuestion}
            loading={loading}
            className="submit-button"
          >
            Submit Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        <h2 className="section-title">📚 Community Questions</h2>
        {questions.length === 0 ? (
          <p>No questions yet. Be the first to ask!</p>
        ) : (
          questions.map((item) => (
            <div key={item.id} className="question-card">
              <div className="question-header">
                <h3>{item.name} asks:</h3>
                {item.topic && (
                  <span className="topic-tag">{item.topic}</span>
                )}
              </div>
              <p className="question-text">{item.question}</p>
              {item.image && (
                <div className="image-preview">
                  <img src={item.image} alt="question" />
                </div>
              )}

              <div className="replies-section">
                <h4><FaRegCommentDots /> Replies</h4>
                {item.replies.length === 0 ? (
                  <p>No replies yet. Be the first to answer!</p>
                ) : (
                  item.replies.map((reply, index) => (
                    <div key={index} className="reply-card">
                      <p>{reply.reply}</p>
                      <span className="reply-author">
                        <strong>{reply.name}</strong> ({reply.email})
                      </span>
                      {reply.image && (
                        <div className="image-preview">
                          <img src={reply.image} alt="reply" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                <Tooltip title="Reply to this question">
                  <Button
                    type="link"
                    onClick={() => openReplyModal(item.id)}
                    loading={loadingReply}
                    className="reply-button"
                  >
                    <FaReply /> Reply
                  </Button>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Reply */}
      <Modal
        title="✍️ Post a Reply"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className="reply-textarea"
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <div className="file-upload">
          <label htmlFor="reply-image">
            <FaImage size={20} /> Upload Image
          </label>
          <input
            type="file"
            id="reply-image"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          {image && <span>Image Selected</span>}
        </div>
        <Button
          type="primary"
          onClick={submitReply}
          loading={loadingReply}
          className="submit-button"
        >
          Submit Reply
        </Button>
      </Modal>

     {/* Forum Rules Section */}
<div className="forum-rules">
  <h2><FaGavel style={{ color: '#d35400' }} /> Forum Rules</h2>
  <ul>
    <li>
      <FaUsers style={{ color: '#2980b9' }} />
      <strong> Be Respectful:</strong> Treat everyone with kindness. Avoid offensive, aggressive, or dismissive behavior.
    </li>
    <li>
      <FaGavel style={{ color: '#c0392b' }} />
      <strong> No Spam or Self-Promotion:</strong> Promotional content, advertisements, or irrelevant links are not allowed.
    </li>
    <li>
      <FaRegCommentDots style={{ color: '#27ae60' }} />
      <strong> Stay On Topic:</strong> Make sure your replies directly contribute to the discussion or answer the question.
    </li>
    <li>
      <FaImage style={{ color: '#8e44ad' }} />
      <strong> Responsible Media Use:</strong> Only upload relevant and respectful images. No offensive or copyrighted content.
    </li>
    <li>
      <FaReply style={{ color: '#16a085' }} />
      <strong> Use the Reply Feature:</strong> Always use the reply button to respond—don’t create a new question to reply.
    </li>
    <li>
      <FaGavel style={{ color: '#f39c12' }} />
      <strong> Follow Community Guidelines:</strong> Any content violating our terms will be removed without notice.
    </li>
  </ul>
</div>

    </div>
  );
};

export default DiscussionForum;
