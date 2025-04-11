// fbase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyCvtpZ6ESh8rYLxO0lX7NnOQzEfzd1djTo",
    authDomain: "photomap-da0c0.firebaseapp.com",
    projectId: "photomap-da0c0",
    storageBucket: "photomap-da0c0.firebasestorage.app",
    messagingSenderId: "28437635364",
    appId: "1:28437635364:web:09d4b50f64303af0da93b1"
  };
  
  firebase.initializeApp(firebaseConfig);
  const storage = firebase.storage();
  const db = firebase.firestore();
