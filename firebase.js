import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
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
   INIT
========================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   GET
========================= */
window.getJugadores = async () => {
  const snap = await getDocs(collection(db, "jugadores"));

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

/* =========================
   GUARDAR
========================= */
window.guardarJugadorFirebase = async (data) => {
  await addDoc(collection(db, "jugadores"), data);
};

/* =========================
   ELIMINAR
========================= */
window.eliminarJugadorFirebase = async (id) => {
  const ref = doc(db, "jugadores", id);
  await deleteDoc(ref);
};

/* =========================
   ACTUALIZAR
========================= */
window.actualizarJugadorFirebase = async (data) => {
  const ref = doc(db, "jugadores", data.id);
  await updateDoc(ref, data);
};
