import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '../config/firebase';

const LoginRegister = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        // Register logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isLogin ? 'Login' : 'Register'}</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your name"
            />
          </div>
        )}
        
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your email"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      
      <div style={styles.switchContainer}>
        <p style={styles.switchText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            style={styles.switchButton}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#2d3748',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#4a5568',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  switchContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  switchText: {
    color: '#718096',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#4299e1',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  error: {
    color: '#e53e3e',
    padding: '10px',
    backgroundColor: '#fed7d7',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
};

export default LoginRegister;