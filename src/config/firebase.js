// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAIJkkLMF2no6waTa2ZAPmnLMOzzhFEc4",
  authDomain: "my-portfolio-64.firebaseapp.com",
  projectId: "my-portfolio-64",
  storageBucket: "my-portfolio-64.appspot.com",
  messagingSenderId: "951706751147",
  appId: "1:951706751147:web:7bb0ebbcee37302c5227ee",
  measurementId: "G-XPX6MR3QE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const fireStore = getFirestore(app); // Firestore instance
const storage = getStorage(app); // Firebase Storage instance
const auth = getAuth(app); // Firebase Auth instance

// Export everything you need
export { app, analytics, fireStore, fireStore as db, storage, auth }; // Export both fireStore and db