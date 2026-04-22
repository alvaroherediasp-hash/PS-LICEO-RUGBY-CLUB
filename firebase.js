// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

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
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

/* =========================
   CONFIG
========================= */
const app = initializeApp({
  apiKey: "AIzaSyCZ5_7V6-s4mOOgdkGOIi5YfInLCM-kl4m",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",

  // ✅ IMPORTANTE
  storageBucket: "liceo-rugby.appspot.com",

  messagingSenderId: "592245047553",
  appId: "1:592245047553:web:1a8b64aa53bdc18be7db00"
});

/* =========================
   INIT
========================= */
const db = getFirestore(app);
const storage = getStorage(app);

// 👇 GLOBAL (clave para app.js)
window.firebaseDB = db;
window.firebaseStorage = storage;

/* =========================
   API GLOBAL
========================= */
window.api = {

  /* =========================
     JUGADORES
  ========================= */
  getJugadores: async () => {
    const snap = await getDocs(collection(db, "jugadores"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  addJugador: (data) =>
    addDoc(collection(db, "jugadores"), data),

  updateJugador: (data) => {
    const { id, ...clean } = data;
    return updateDoc(doc(db, "jugadores", id), clean);
  },

  deleteJugador: (id) =>
    deleteDoc(doc(db, "jugadores", id)),

  /* =========================
     ASISTENCIA (NO TOCADO)
  ========================= */
  addAsistencia: (data) =>
    addDoc(collection(db, "asistencia"), data),

  getAsistenciaByJugador: async (id) => {
    const q = query(collection(db, "asistencia"), where("jugadorId", "==", id));
    const snap = await getDocs(q);

    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => Number(a.semana) - Number(b.semana));
  },

  getAsistenciaById: async (id) => {
    const snap = await getDoc(doc(db, "asistencia", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateAsistencia: (data) => {
    const { id, ...clean } = data;
    return updateDoc(doc(db, "asistencia", id), clean);
  },

  deleteAsistencia: (id) =>
    deleteDoc(doc(db, "asistencia", id)),

  /* =========================
     TERCER TIEMPO (NO TOCADO)
  ========================= */
  addPartido: (data) =>
    addDoc(collection(db, "tercer_tiempo"), data),

  getPartidos: async () => {
    const snap = await getDocs(collection(db, "tercer_tiempo"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  updatePago: (partidoId, pagos) =>
    updateDoc(doc(db, "tercer_tiempo", partidoId), { pagos }),

  deletePartido: (id) =>
    deleteDoc(doc(db, "tercer_tiempo", id))
};

/* =========================
   DEBUG (opcional)
========================= */
console.log("🔥 Firebase OK");
console.log("API:", window.api);
