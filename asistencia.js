const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let jugadores = [];
let asistencia = [];

/* =========================
   INIT
========================= */
window.onload = async () => {

  await cargarJugadores();
  await cargarAsistencia();
  cargarSemanas();
};

/* =========================
   FETCH
========================= */
async function api(url) {
  let r = await fetch(url);
  return await r.json();
}

/* =========================
   JUGADORES (TABLA PRINCIPAL)
========================= */
async function cargarJugadores() {

  let r = await api(API + "?tipo=jugadores");
  jugadores = r.datos?.jugadores || [];

  let cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = `
    <table class="tabla-pro">
      <thead>
        <tr>
          <th>DNI</th>
          <th>Jugador</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        ${jugadores.map(j => `
          <tr>
            <td>${j.c1}</td>
            <td>${j.c2}</td>
            <td>
              <button class="btn btn-sec" onclick="verJugador('${j.c2}')">
                Ver
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* =========================
   CARGAR ASISTENCIA (DATA)
========================= */
async function cargarAsistencia() {

  let r = await api(API + "?tipo=asistencia");
  asistencia = r.datos?.asistencia || [];
}

/* =========================
   VER JUGADOR (PRO)
========================= */
function verJugador(dni) {

  let data = asistencia.filter(a => a.c1 === dni);

  let cont = document.getElementById("detalleJugador");

  if (!data.length) {
    cont.innerHTML = "<p>No tiene asistencia registrada</p>";
  } else {

    cont.innerHTML = `
      <table class="tabla-pro">
        <thead>
          <tr>
            <th>Semana</th>
            <th>Día 1</th>
            <th>Día 2</th>
            <th>Día 3</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>

        <tbody>
          ${data.map(a => {

            let estado =
              a.c4 == 1 && a.c5 == 1 && a.c6 == 1 ? "🟢 COMPLETO" :
              (a.c4 == 1 || a.c5 == 1 || a.c6 == 1) ? "🟡 INCOMPLETO" :
              "🔴 NO ASISTIÓ";

            let fecha = a.c8 ? new Date(a.c8).toLocaleDateString() : "-";

            return `
              <tr>
                <td>${a.c3 || "-"}</td>
                <td>${a.c4 ? "✔" : "-"}</td>
                <td>${a.c5 ? "✔" : "-"}</td>
                <td>${a.c6 ? "✔" : "-"}</td>
                <td>${estado}</td>
                <td>${fecha}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  document.getElementById("modalJugador").classList.add("show");
}

/* =========================
   SELECT + SEMANAS
========================= */
function cargarSemanas() {

  let sel = document.getElementById("semana");

  sel.innerHTML = "";

  for (let i = 1; i <= 40; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}

/* =========================
   MODAL ASISTENCIA
========================= */
function abrirModalAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">-- Selecciona jugador --</option>
  ` + jugadores.map(j => `
    <option value="${j.c2}" data-nombre="${j.c3}">
      ${j.c2} - ${j.c3}
    </option>
  `).join("");
}
/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let select = document.getElementById("jugadorSelect");
  let option = select.selectedOptions[0];

  let dni = select.value;
  let nombre = option.text;

  if (!dni) {
    alert("Selecciona jugador");
    return;
  }

  let data = {
    dni: dni,
    nombre: nombre,
    semana: document.getElementById("semana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked,
    fecha: new Date()
  };

  await guardarAsistenciaFirebase(data);

  alert("✅ Guardado en Firebase");

  cerrar();
}
/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));


}

