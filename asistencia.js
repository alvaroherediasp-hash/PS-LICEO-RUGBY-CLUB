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
   JUGADORES
========================= */
async function cargarJugadores() {
  jugadores = await window.getJugadores();
  renderTabla();
}

/* =========================
   ASISTENCIA
========================= */
async function cargarAsistencia() {
  asistencia = await window.getAsistencia();
}

/* =========================
   TABLA PRINCIPAL
========================= */
function renderTabla() {

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
            <td>${j.dni}</td>
            <td>${j.nombre}</td>
            <td>
              <button onclick="verJugador('${j.id}')">
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
   VER JUGADOR
========================= */
window.verJugador = function(id) {

  let data = asistencia.filter(a => a.jugadorId === id);

  let cont = document.getElementById("detalleJugador");

  if (!data.length) {
    cont.innerHTML = "<p>No tiene asistencia registrada</p>";
  } else {

    cont.innerHTML = `
      <table class="tabla-pro">
        <thead>
          <tr>
            <th>Semana</th>
            <th>D1</th>
            <th>D2</th>
            <th>Partido</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>

        <tbody>
          ${data.map(a => `
            <tr>
              <td>${a.semana}</td>
              <td>${a.dia1 ? "✔" : "-"}</td>
              <td>${a.dia2 ? "✔" : "-"}</td>
              <td>${a.partido ? "✔" : "-"}</td>
              <td>${a.estado}</td>
              <td>${a.fecha}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  document.getElementById("modalJugador").classList.add("show");
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

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">-- Selecciona jugador --</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre}
    </option>
  `).join("");
}

/* =========================
   LUNES
========================= */
function getLunes(semana) {

  let año = new Date().getFullYear();
  let inicio = new Date(año, 0, 1);

  let lunes = new Date(inicio);
  lunes.setDate(inicio.getDate() + (semana - 1) * 7);

  return lunes.toLocaleDateString();
}

/* =========================
   ESTADO
========================= */
function calcularEstado(d1, d2, p) {

  let total = [d1, d2, p].filter(x => x).length;

  return total === 3
    ? "🟢 Completo"
    : total > 0
    ? "🟡 Incompleto"
    : "🔴 No asistió";
}

/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let jugadorId = document.getElementById("jugadorSelect").value;

  if (!jugadorId) {
    return alert("Selecciona jugador");
  }

  let semana = document.getElementById("semana").value;

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let p  = document.getElementById("dia3").checked;

  let data = {
    jugadorId,
    semana,
    fecha: getLunes(semana),

    dia1: d1,
    dia2: d2,
    partido: p,

    estado: calcularEstado(d1, d2, p)
  };

  try {
    await window.guardarAsistenciaFirebase(data);

    alert("✅ Asistencia guardada");

    cerrar();
    cargarAsistencia();

  } catch (e) {
    console.error(e);
    alert("❌ Error");
  }
}

/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
