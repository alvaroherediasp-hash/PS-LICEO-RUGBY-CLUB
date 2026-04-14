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
  where
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
  const snap = await getDocs(collection(db, "jugadores"));

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

/* =========================
   ASISTENCIA
========================= */

window.guardarAsistenciaFirebase = async (data) => {
  return await addDoc(collection(db, "asistencia"), {
    ...data,
    fechaCreacion: new Date()
  });
};

window.getAsistencia = async () => {
  const snap = await getDocs(collection(db, "asistencia"));

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

window.getAsistenciaPorJugador = async (jugadorId) => {

  const q = query(
    collection(db, "asistencia"),
    where("jugadorId", "==", jugadorId)
  );

  const snap = await getDocs(q);

  let lista = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  lista.sort((a, b) => Number(a.semana) - Number(b.semana));

  return lista;
};

window.existeAsistencia = async (jugadorId, semana) => {

  const q = query(
    collection(db, "asistencia"),
    where("jugadorId", "==", jugadorId),
    where("semana", "==", semana)
  );

  const snap = await getDocs(q);
  return !snap.empty;
};

window.eliminarAsistenciaFirebase = async (id) => {
  const ref = doc(db, "asistencia", id);
  await deleteDoc(ref);
};

window.actualizarAsistenciaFirebase = async (data) => {
  const ref = doc(db, "asistencia", data.id);

  const { id, ...cleanData } = data; // 🔥 evita error Firestore

  await updateDoc(ref, cleanData);
};
