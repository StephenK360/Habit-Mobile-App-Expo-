import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCrImmAH6WmGLbub9o4tpOl68xt1tIkRXs",
  databaseURL: "https://habit-building-app-96010-default-rtdb.firebaseio.com/",
  projectId: "habit-building-app-96010",
  // messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID, //this is for firebase push notifications if you need it 
  // appId: 1:193390348140:web:d3bebf9f90025f764b1549  //critical for auth
  // measurementId: process.env.FIREBASE_MEASUREMENT_ID, //google analytics
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, db, auth, database };