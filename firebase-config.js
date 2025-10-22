import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDFl24bK_V1DiTGGcfP_mXpzvhfrZ0A5M0",
    authDomain: "gotouniversity-5923d.firebaseapp.com",
    projectId: "gotouniversity-5923d",
    storageBucket: "gotouniversity-5923d.firebasestorage.app",
    messagingSenderId: "79736805581",
    appId: "1:79736805581:web:af2952dd5a6e399574b184"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc };
