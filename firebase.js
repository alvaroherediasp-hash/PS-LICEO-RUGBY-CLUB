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

const firebaseConfig = {
  apiKey: "AIzaSyCZ5_7V6-s4mOOgdkGOIi5YfInLCM-kl4I",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",
  storageBucket: "liceo-rugby.firebasestorage.app",
  messagingSenderId: "592245047553",
  appId: "1:592245047553:web:1a8b64aa53bdc18be7db00"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* EXPORT GLOBAL */
window.db = db;

/* ================= JUGADORES ================= */

window.getJugadores = async () => {
  const snap = await getDocs(collection(db, "jugadores"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

window.guardarJugadorFirebase = async (data) => {
  return await addDoc(collection(db, "jugadores"), data);
};

window.actualizarJugadorFirebase = async (data) => {
  const { id, ...clean } = data;
  await updateDoc(doc(db, "jugadores", id), clean);
};

window.eliminarJugadorFirebase = async (id) => {
  await deleteDoc(doc(db, "jugadores", id));
};

/* ================= ASISTENCIA ================= */

window.guardarAsistenciaFirebase = async (data) => {
  return await addDoc(collection(db, "asistencia"), data);
};

window.getAsistenciaPorJugador = async (jugadorId) => {
  const q = query(collection(db, "asistencia"), where("jugadorId", "==", jugadorId));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => Number(a.semana) - Number(b.semana));
};

window.getAsistenciaById = async (id) => {
  const snap = await getDoc(doc(db, "asistencia", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

window.actualizarAsistenciaFirebase = async (data) => {
  const { id, ...clean } = data;
  await updateDoc(doc(db, "asistencia", id), clean);
};

window.eliminarAsistenciaFirebase = async (id) => {
  await deleteDoc(doc(db, "asistencia", id));
};
