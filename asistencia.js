const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let datos = { jugadores: [] };

/* =========================
   FETCH
========================= */
async function api(url, opt = {}) {
  let r = await fetch(url, opt);
  return r.json();
}

/* =========================
   INIT
========================= */
window.onload = async () => {

  let r = await api(API);
  datos = r.datos;

  cargarSelect();
  cargarSemanas();
  cargarTabla();
};

/* =========================
   SELECT JUGADORES
========================= */
function cargarSelect() {

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = datos.jugadores.map(j =>
    `<option value="${j.c2}">
      ${j.c2} - ${j.c3}
    </option>`
  ).join("");
}

/* =========================
   SEMANAS
========================= */
function cargarSemanas() {

  let sel = document.getElementById("semana");

  sel.innerHTML = "";
  for (let i = 1; i <= 40; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}

/* =========================
   ABRIR MODAL
========================= */
function abrirModalAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");
}

/* =========================
   CERRAR MODAL
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

/* =========================
   GUARDAR ASISTENCIA
========================= */
async function guardarAsistencia() {

  let data = {
    accion: "guardar_asistencia",
    dni: document.getElementById("jugadorSelect").value,
    nombre: document.getElementById("jugadorSelect").selectedOptions[0].text,
    semana: document.getElementById("semana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked
  };

  await api(API, {
    method: "POST",
    body: JSON.stringify(data)
  });

  cerrar();
  cargarTabla();
}

/* =========================
   TABLA GENERAL
========================= */
async function cargarTabla() {

  let r = await api(API);
  let data = r.datos.asistencia || [];

  let cont = document.getElementById("tablaAsistencia");

  if (!data.length) {
    cont.innerHTML = "<p>No hay asistencia registrada</p>";
    return;
  }

  cont.innerHTML = `
    <table class="tabla-pro">
      <thead>
        <tr>
          <th>Jugador</th>
          <th>DNI</th>
          <th>Semana</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(a => {

          let estado =
            a.c4 == 1 && a.c5 == 1 && a.c6 == 1 ? "🟢 Completo" :
            (a.c4 == 1 || a.c5 == 1 || a.c6 == 1) ? "🟡 Incompleto" :
            "🔴 No asistió";

          return `
            <tr>
              <td>${a.c2}</td>
              <td>${a.c1}</td>
              <td>${a.c3 || "-"}</td>
              <td>${estado}</td>
              <td>${new Date(a.c8).toLocaleDateString()}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}