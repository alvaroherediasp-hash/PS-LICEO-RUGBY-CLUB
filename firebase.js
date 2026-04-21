// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 👇 AGREGAR ESTO
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

// 🔥 CONFIG
const app = initializeApp({
  apiKey: "AIzaSyCZ5_7V6-s4mOOgdkGOIi5YfInLCM-kl4m",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",

  // ✅ CORREGIDO
  storageBucket: "liceo-rugby.appspot.com",

  messagingSenderId: "592245047553",
  appId: "1:592245047553:web:1a8b64aa53bdc18be7db00"
});

const db = getFirestore(app);

// 👇 CREAR STORAGE
const storage = getStorage(app);

// 👇 HACERLO GLOBAL (CLAVE)
window.firebaseStorage = storage;
window.firebaseDB = db;
