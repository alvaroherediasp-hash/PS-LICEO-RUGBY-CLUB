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

/* =========================
   CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCZ5_7V6-s4mOOgdkGOIi5YfInLCM-kl4I",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",
  storageBucket: "liceo-rugby.firebasestorage.app",
  messagingSenderId: "592245047553",
  appId: "1:592245047553:web:1a8b64aa53bdc18be7db00"
};

/* =========================
   INIT FIREBASE
========================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.firebaseReady = true;

/* =========================
   JUGADORES
========================= */
window.getJugadores = async () => {
  try {
    const snap = await getDocs(collection(db, "jugadores"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    console.log("🔥 Firebase jugadores:", data);

    return data;

  } catch (e) {
    console.error("❌ ERROR getJugadores:", e);
    return [];
  }
};

/* =========================
   ASISTENCIA
========================= */

/* CREAR */
window.guardarAsistenciaFirebase = async (data) => {
  try {
    return await addDoc(collection(db, "asistencia"), {
      ...data,
      fechaCreacion: new Date()
    });
  } catch (error) {
    console.error("Error guardarAsistencia:", error);
    throw error;
  }
};

/* TRAER TODAS */
window.getAsistencia = async () => {
  try {
    const snap = await getDocs(collection(db, "asistencia"));

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Error getAsistencia:", error);
    return [];
  }
};

/* POR JUGADOR */
window.getAsistenciaPorJugador = async (jugadorId) => {
  try {
    const q = query(
      collection(db, "asistencia"),
      where("jugadorId", "==", jugadorId)
    );

    const snap = await getDocs(q);

    const lista = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    return lista.sort((a, b) => Number(a.semana) - Number(b.semana));

  } catch (error) {
    console.error("Error getAsistenciaPorJugador:", error);
    return [];
  }
};

/* POR ID */
window.getAsistenciaById = async (id) => {
  try {
    const ref = doc(db, "asistencia", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data()
    };

  } catch (error) {
    console.error("Error getAsistenciaById:", error);
    return null;
  }
};

/* EXISTE */
window.existeAsistencia = async (jugadorId, semana) => {
  try {
    const q = query(
      collection(db, "asistencia"),
      where("jugadorId", "==", jugadorId),
      where("semana", "==", semana)
    );

    const snap = await getDocs(q);
    return !snap.empty;

  } catch (error) {
    console.error("Error existeAsistencia:", error);
    return false;
  }
};

/* ELIMINAR */
window.eliminarAsistenciaFirebase = async (id) => {
  try {
    await deleteDoc(doc(db, "asistencia", id));
  } catch (error) {
    console.error("Error eliminarAsistencia:", error);
  }
};

/* ACTUALIZAR */
window.actualizarAsistenciaFirebase = async (data) => {
  try {
    const { id, ...cleanData } = data;

    const ref = doc(db, "asistencia", id);
    await updateDoc(ref, cleanData);

  } catch (error) {
    console.error("Error actualizarAsistencia:", error);
    throw error;
  }
};
