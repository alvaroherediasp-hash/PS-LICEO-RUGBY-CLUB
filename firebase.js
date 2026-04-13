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
  apiKey: "TU_API_KEY",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",
  storageBucket: "liceo-rugby.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

/* =========================
   INIT
========================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   GET (TRAER JUGADORES)
========================= */
window.getJugadores = async () => {
  const snap = await getDocs(collection(db, "jugadores"));

  return snap.docs.map(d => ({
    id: d.id, // 🔥 IMPORTANTE
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
   ACTUALIZAR (POR ID)
========================= */
window.actualizarJugadorFirebase = async (data) => {
  const ref = doc(db, "jugadores", data.id);
  await updateDoc(ref, data);
};

/* =========================
   ELIMINAR (POR ID)
========================= */
window.eliminarJugadorFirebase = async (id) => {
  const ref = doc(db, "jugadores", id);
  await deleteDoc(ref);
};
