import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "moodify-15a5b.firebaseapp.com",
  projectId: "moodify-15a5b",
  storageBucket: "moodify-15a5b.firebasestorage.app",
  messagingSenderId: "166618097317",
  appId: "1:166618097317:web:c6650196842d9f5ba1cf4c",
  measurementId: "G-77J34JKH4L",
  // databaseURL: "https://moodify-15a5b-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
