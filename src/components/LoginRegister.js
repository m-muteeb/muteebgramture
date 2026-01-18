import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase';

const auth = getAuth(app);

const LoginRegisterPage = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={loginStyles.container}>
      <button style={loginStyles.closeButton} onClick={onClose}>×</button>
      <h2 style={loginStyles.title}>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={loginStyles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={loginStyles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={loginStyles.input}
        />
        <button type="submit" style={loginStyles.submitButton}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p style={loginStyles.toggleText} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
      {error && <p style={loginStyles.errorText}>{error}</p>}
    </div>
  );
};

const loginStyles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    padding: '32px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#718096',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#2d3748',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    background: '#2d3748',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  toggleText: {
    textAlign: 'center',
    color: '#4299e1',
    cursor: 'pointer',
    marginTop: '16px',
  },
  errorText: {
    color: '#e53e3e',
    textAlign: 'center',
    marginTop: '16px',
  },
};

export default LoginRegisterPage;