const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let jugadores = [];
let asistencia = [];

/* =========================
   FETCH
========================= */
async function api(url) {
  let r = await fetch(url);
  return await r.json();
}
window.onload = async () => {

  await cargarJugadores();
  await cargarSemanas();
  await cargarAsistencia();
};
async function cargarJugadores() {

  let r = await api(API + "?tipo=jugadores");
  jugadores = r.datos?.jugadores || [];

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">-- Selecciona jugador --</option>
  ` + jugadores.map(j =>
    `<option value="${j.c2}">
      ${j.c2} - ${j.c3}
    </option>`
  ).join("");
}
function cargarSemanas() {

  let sel = document.getElementById("semana");

  sel.innerHTML = "";

  for (let i = 1; i <= 40; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}
async function guardarAsistencia() {

  let dni = document.getElementById("jugadorSelect").value;

  if (!dni) {
    alert("Selecciona un jugador");
    return;
  }

  let nombre = document.getElementById("jugadorSelect")
    .selectedOptions[0].text;

  let data = {
    accion: "guardar_asistencia",
    dni,
    nombre,
    semana: document.getElementById("semana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });

  cerrar();
  cargarAsistencia();
}
async function cargarAsistencia() {

  let r = await api(API + "?tipo=asistencia");
  asistencia = r.datos?.asistencia || [];

  let cont = document.getElementById("tablaAsistencia");

  if (!asistencia.length) {
    cont.innerHTML = "<p>No hay asistencia</p>";
    return;
  }

  cont.innerHTML = `
    <table class="tabla-pro">
      <thead>
        <tr>
          <th>DNI</th>
          <th>Jugador</th>
          <th>Semana</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        ${asistencia.map(a => {

          let estado =
            a.c4 == 1 && a.c5 == 1 && a.c6 == 1 ? "🟢 COMPLETO" :
            (a.c4 == 1 || a.c5 == 1 || a.c6 == 1) ? "🟡 INCOMPLETO" :
            "🔴 NO ASISTIÓ";

          let fecha = a.c8 ? new Date(a.c8).toLocaleDateString() : "-";

          return `
            <tr>
              <td>${a.c1}</td>
              <td>${a.c2}</td>
              <td>${a.c3}</td>
              <td>${estado}</td>
              <td>${fecha}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
