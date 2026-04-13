let jugadores = [];
let jugadorActual = null;

/* =========================
   INIT
========================= */
window.onload = async () => {
  jugadores = await window.getJugadores();
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
   MODAL
========================= */
function abrirModalAsistencia() {

  document.getElementById("modalAsistencia").classList.add("show");

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre}
    </option>
  `).join("");

  setFechaHoy(); // 🔥 clave
}

/* =========================
   FECHA HOY AUTOMÁTICA
========================= */
function setFechaHoy() {
  let hoy = new Date();

  let yyyy = hoy.getFullYear();
  let mm = String(hoy.getMonth() + 1).padStart(2, '0');
  let dd = String(hoy.getDate()).padStart(2, '0');

  document.getElementById("fechaSemana").value = `${yyyy}-${mm}-${dd}`;
}

/* =========================
   SEMANAS
========================= */
function cargarSemanas() {
  let sel = document.getElementById("semana");

  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}

/* =========================
   ESTADO AUTOMÁTICO
========================= */
function actualizarEstado() {

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let d3 = document.getElementById("dia3").checked;

  let estado =
    (d1 && d2) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  document.getElementById("estadoSemana").value = estado;
}

["dia1","dia2","dia3"].forEach(id => {
  document.addEventListener("change", actualizarEstado);
});

/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let id = document.getElementById("jugadorSelect").value;

  if (!id) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == id);

  let semana = document.getElementById("semana").value;
  let fecha = document.getElementById("fechaSemana").value;

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
    fechaSemana: fecha,
    fechaCreacion: new Date(),
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado: estado,
    detalle: document.getElementById("detalleSemana")?.value || ""
  };

  try {
    await window.guardarAsistenciaFirebase(data);
    alert("✅ Asistencia guardada");

    cerrar();
  } catch (e) {
    console.error(e);
    alert("❌ Error guardando");
  }
}

/* =========================
   VER JUGADOR
========================= */
window.verJugador = async function(id) {

  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  if (!data.length) {
    cont.innerHTML = "<p>Sin asistencia</p>";
  } else {
    cont.innerHTML = data.map(a => `
      <div class="card">
        <b>Semana ${a.semana}</b>
        <div>Fecha: ${a.fechaSemana}</div>
        <div>
          Día1: ${a.dia1 ? "✔" : "-"} |
          Día2: ${a.dia2 ? "✔" : "-"} |
          Partido: ${a.dia3 ? "✔" : "-"}
        </div>
        <div>${a.estado}</div>
        <div>${a.detalle || ""}</div>
      </div>
    `).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
}

/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
