import React, { useState, useEffect } from "react";
import { message } from "antd";
import { addDoc, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { fireStore } from "../config/firebase";

const CommentSection = ({ subCategory, topicId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [newReply, setNewReply] = useState("");
  const [replyingToIndex, setReplyingToIndex] = useState(null);

  // Fetch the comments specifically for the topic (subCategory and topicId)
  useEffect(() => {
    fetchComments();
  }, [subCategory, topicId]);

  const fetchComments = async () => {
    try {
      const commentsRef = collection(
        fireStore,
        "comments",
        subCategory,
        "topicComments",
        topicId,
        "replies"
      );
      const querySnapshot = await getDocs(commentsRef);
      const commentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsList);
    } catch (error) {
      message.error("Failed to fetch comments.");
      console.error(error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment({
      ...newComment,
      [e.target.name]: e.target.value,
    });
  };

  const validateCommentForm = () => {
    const { name, email, comment } = newComment;
    if (!name || !email || !comment) {
      message.warning("Please fill out all fields before submitting your comment.");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      message.warning("Please enter a valid email address.");
      return false;
    }
    if (comment.trim().length < 5) {
      message.warning("Comment must be at least 5 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmitComment = async () => {
    if (!validateCommentForm()) return;
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    const newCommentWithDate = { ...newComment, date: formattedDate };
    try {
      const docRef = await addDoc(
        collection(fireStore, "comments", subCategory, "topicComments", topicId, "replies"),
        newCommentWithDate
      );
      setComments([...comments, { id: docRef.id, ...newCommentWithDate }]);
      setNewComment({ name: "", email: "", comment: "" });
      message.success("Comment added successfully!");
    } catch (error) {
      message.error("Failed to add comment.");
      console.error(error);
    }
  };

  const handleReplyChange = (e) => {
    setNewReply(e.target.value);
  };

  const validateReply = () => {
    if (!newReply.trim()) {
      message.warning("Please enter a reply.");
      return false;
    }
    return true;
  };

  const handleSubmitReply = async (commentIndex) => {
    if (comments[commentIndex]) {
      if (!validateReply()) return;
      const updatedComments = [...comments];
      const commentRef = doc(
        fireStore,
        "comments",
        subCategory,
        "topicComments",
        topicId,
        "replies",
        comments[commentIndex].id
      );
      const updatedReplies = comments[commentIndex].replies
        ? [...comments[commentIndex].replies, { text: newReply, date: new Date().toLocaleString() }]
        : [{ text: newReply, date: new Date().toLocaleString() }];
      try {
        await updateDoc(commentRef, { replies: updatedReplies });
        updatedComments[commentIndex].replies = updatedReplies;
        setComments(updatedComments);
        setNewReply("");
        setReplyingToIndex(null);
        message.success("Reply added successfully!");
      } catch (error) {
        message.error("Failed to submit reply.");
        console.error(error);
      }
    } else {
      message.error("Invalid comment index.");
    }
  };

  return (
    <div className="comment-section" style={styles.commentSection}>
      <h3 style={styles.heading}>Leave a Comment</h3>
      <p style={styles.commentCount}>
        {comments.length === 0
          ? "This post has no comments yet."
          : `This post has ${comments.length} ${comments.length === 1 ? "comment" : "comments"}.`}
      </p>

      <div className="comment-form row">
        <div className="col-12 col-md-6 col-lg-4">
          <input
            type="text"
            name="name"
            value={newComment.name}
            onChange={handleCommentChange}
            placeholder="Your Name"
            className="comment-input form-control mt-3"
            style={styles.input}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <input
            type="email"
            name="email"
            value={newComment.email}
            onChange={handleCommentChange}
            placeholder="Your Email"
            className="comment-input form-control"
            style={styles.input}
          />
        </div>
        <div className="col-12 mt-3">
          <textarea
            name="comment"
            value={newComment.comment}
            onChange={handleCommentChange}
            placeholder="Your Comment"
            className="comment-textarea form-control"
            style={styles.textarea}
          />
        </div>
        <div className="col-12 mt-4">
          <button
            onClick={handleSubmitComment}
            className="btn btn-primary btn-block"
            style={styles.submitButton}
          >
            Submit Comment
          </button>
        </div>
      </div>

      <div className="comments-list" style={styles.commentsList}>
        {comments.map((comment, index) => (
          <div key={index} className="comment-item" style={styles.commentItem}>
            <p style={styles.commentAuthor}>{comment.name}</p>
            <p style={styles.commentText}>{comment.comment}</p>
            <p style={styles.commentDate}>{comment.date}</p>

            <div className="replies" style={styles.replies}>
              {comment.replies &&
                comment.replies.map((reply, replyIndex) => (
                  <div
                    key={replyIndex}
                    className="comment-reply"
                    style={styles.commentReply}
                  >
                    <p style={styles.replyText}>{reply.text}</p>
                    <p style={styles.replyDate}>{reply.date}</p>
                  </div>
                ))}
            </div>

            {replyingToIndex !== index && (
              <button
                onClick={() => setReplyingToIndex(index)}
                className="reply-button"
                style={styles.replyButton}
              >
                Reply
              </button>
            )}

            {replyingToIndex === index && (
              <div className="reply-form" style={styles.replyForm}>
                <textarea
                  value={newReply}
                  onChange={handleReplyChange}
                  className="reply-input form-control"
                  placeholder="Write a reply..."
                  style={styles.replyInput}
                ></textarea>
                <div style={styles.replyButtons}>
                  <button
                    onClick={() => handleSubmitReply(index)}
                    className="submit-reply-button"
                    style={styles.submitReplyButton}
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => setReplyingToIndex(null)}
                    style={styles.cancelReplyButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  commentSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#000",
    marginBottom: "10px",
  },
  commentCount: {
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  input: {
    borderRadius: "8px",
    padding: "10px",
    fontSize: "1rem",
  },
  textarea: {
    borderRadius: "8px",
    padding: "10px",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
  },
  submitButton: {
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "1rem",
    transition: "background-color 0.3s ease",
  },
  commentsList: {
    marginTop: "30px",
  },
  commentItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginBottom: "5px",
  },
  commentText: {
    fontSize: "1rem",
    marginBottom: "5px",
  },
  commentDate: {
    fontSize: "0.85rem",
    color: "#666",
    marginBottom: "10px",
  },
  replies: {
    marginLeft: "20px",
    paddingLeft: "15px",
    borderLeft: "3px solid #007bff",
  },
  commentReply: {
    backgroundColor: "#fff",
    borderRadius: "6px",
    padding: "10px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.3s ease",
  },
  replyText: {
    fontSize: "0.95rem",
    marginBottom: "5px",
  },
  replyDate: {
    fontSize: "0.8rem",
    color: "#777",
  },
  replyButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 15px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  replyForm: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    animation: "slideDown 0.3s ease",
  },
  replyInput: {
    borderRadius: "6px",
    padding: "10px",
    fontSize: "0.95rem",
    minHeight: "80px",
    resize: "vertical",
    marginBottom: "10px",
  },
  replyButtons: {
    display: "flex",
    gap: "10px",
  },
  submitReplyButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 15px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  cancelReplyButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 15px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

// Add keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .comment-item:hover {
    transform: translateY(-2px);
  }
  .reply-button:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  .submit-reply-button:hover {
    background-color: #218838;
  }
  .cancel-reply-button:hover {
    background-color: #c82333;
  }
  @media (max-width: 768px) {
    .comment-section {
      padding: 15px;
    }
    .comment-item {
      padding: 10px;
    }
    .replies {
      margin-left: 10px;
      padding-left: 10px;
    }
    .reply-form {
      padding: 10px;
    }
    .reply-input {
      font-size: 0.9rem;
    }
    .reply-button, .submit-reply-button, .cancel-reply-button {
      font-size: 0.85rem;
      padding: 6px 12px;
    }
  }
  @media (max-width: 576px) {
    .comment-section {
      padding: 10px;
    }
    .heading {
      font-size: 1.5rem;
    }
    .comment-count {
      font-size: 1rem;
    }
    .input, .textarea, .reply-input {
      font-size: 0.85rem;
    }
  }
`;
document.head.appendChild(styleSheet);

export default CommentSection;