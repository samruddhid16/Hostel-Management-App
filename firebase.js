// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDS2bCbM6JH133yxRxuPlds_gIh6Pg1_Yw",
    authDomain: "hostel-ecacb.firebaseapp.com",
    projectId: "hostel-ecacb",
    storageBucket: "hostel-ecacb.firebasestorage.app",
    messagingSenderId: "711703529767",
    appId: "1:711703529767:web:0389a418375845b4b2c102",
    measurementId: "G-77JGK9WTGR"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

export { auth };