import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",
  storageBucket: "liceo-rugby.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 GET
window.getJugadores = async () => {
  const snap = await getDocs(collection(db, "jugadores"));
  return snap.docs.map(doc => doc.data());
};

// 🔥 SAVE
window.guardarJugadorFirebase = async (data) => {
  await addDoc(collection(db, "jugadores"), data);
};
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 GET
window.getJugadores = async () => {
  const snap = await getDocs(collection(db, "jugadores"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// 🔥 GUARDAR
window.guardarJugadorFirebase = async (data) => {
  await addDoc(collection(db, "jugadores"), data);
};

// 🔥 ELIMINAR
window.eliminarJugadorFirebase = async (dni) => {
  let snap = await getDocs(collection(db, "jugadores"));

  snap.forEach(async d => {
    if (d.data().dni == dni) {
      await deleteDoc(doc(db, "jugadores", d.id));
    }
  });
};

// 🔥 ACTUALIZAR
window.actualizarJugadorFirebase = async (data) => {
  let snap = await getDocs(collection(db, "jugadores"));

  snap.forEach(async d => {
    if (d.data().dni == data.dni) {
      await updateDoc(doc(db, "jugadores", d.id), data);
    }
  });
};
