let jugadores = [];
let asistencia = [];
let jugadorActual = null;

/* =========================
   INIT
========================= */
window.onload = async () => {
  jugadores = await window.getJugadores();
  asistencia = await window.getAsistencia();

  renderJugadores();
  cargarSemanas();
};

/* =========================
   TABLA JUGADORES
========================= */
function renderJugadores() {

  let cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">

      <div>
        <b>${j.nombre}</b>
        <div>DNI: ${j.dni}</div>
      </div>

      <button onclick="verJugador('${j.id}')">
        👁 Ver
      </button>

    </div>
  `).join("");
}

/* =========================
   VER JUGADOR
========================= */
window.verJugador = async function(id) {

  jugadorActual = jugadores.find(j => j.id == id);

  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  if (!data.length) {
    cont.innerHTML = "<p>Sin asistencia</p>";
  } else {
    cont.innerHTML = data.map(a => `
      <div class="card">

        <b>Semana ${a.semana}</b>
        <div>${a.fechaSemana}</div>

        <div>
          Día1: ${a.dia1 ? "✔" : "-"} |
          Día2: ${a.dia2 ? "✔" : "-"} |
          Partido: ${a.dia3 ? "✔" : "-"}
        </div>

        <div><b>${a.estado}</b></div>
        <div>${a.detalle || ""}</div>

      </div>
    `).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
};

/* =========================
   MODAL
========================= */
function abrirModalAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre}
    </option>
  `).join("");
}

/* =========================
   SEMANAS + FECHA LUNES
========================= */
function getFechaLunes(semana) {
  let hoy = new Date();
  let primerDia = new Date(hoy.getFullYear(), 0, 1);
  let dias = (semana - 1) * 7;
  let fecha = new Date(primerDia.setDate(primerDia.getDate() + dias));

  return fecha.toLocaleDateString();
}

function cargarSemanas() {
  let sel = document.getElementById("semana");

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}

/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let id = document.getElementById("jugadorSelect").value;

  if (!id) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == id);

  let semana = document.getElementById("semana").value;

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let d3 = document.getElementById("dia3").checked;

  let estado =
    (d1 && d2) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  let data = {
    jugadorId: id,
    dni: jugador.dni,
    nombre: jugador.nombre,
    semana: semana,
    fechaSemana: getFechaLunes(semana),
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado: estado,
    detalle: document.getElementById("detalleSemana")?.value || ""
  };

  await window.guardarAsistenciaFirebase(data);

  alert("✅ Asistencia guardada");

  cerrar();
}

/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
