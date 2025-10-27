// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYWIMH7uq7ZnI4-zS0ESN-S1vSPZchlFA",
  authDomain: "csc490-capstone.firebaseapp.com",
  projectId: "csc490-capstone",
  storageBucket: "csc490-capstone.firebasestorage.app",
  messagingSenderId: "1066875183815",
  appId: "1:1066875183815:web:8a838564bcbb448f6e94e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)