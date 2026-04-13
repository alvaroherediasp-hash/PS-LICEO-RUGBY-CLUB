
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZ5_7V6-s4mOOgdkGOIi5YfInLCM-kl4I",
  authDomain: "liceo-rugby.firebaseapp.com",
  projectId: "liceo-rugby",
  storageBucket: "liceo-rugby.firebasestorage.app",
  messagingSenderId: "592245047553",
  appId: "1:592245047553:web:1a8b64aa53bdc18be7db00"
};

// 🔥 iniciar firebase
const app = initializeApp(firebaseConfig);

// 🔥 iniciar base de datos
const db = getFirestore(app);

// ==========================
// 🔥 FUNCIONES GLOBALES
// ==========================

// Cargar jugadores
window.getJugadores = async function () {
  const querySnapshot = await getDocs(collection(db, "jugadores"));
  let lista = [];
  querySnapshot.forEach(doc => lista.push(doc.data()));
  return lista;
};

// Guardar asistencia
window.guardarAsistenciaFirebase = async function (data) {
  await addDoc(collection(db, "asistencia"), data);
};
// 🔥 Guardar jugador
window.guardarJugadorFirebase = async function (data) {
  await addDoc(collection(db, "jugadores"), data);
};