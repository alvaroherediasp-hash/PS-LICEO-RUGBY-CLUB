let jugadores = [];
let editId = null;

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", async () => {

  while (!window.api) {
    await new Promise(r => setTimeout(r, 200));
  }

  jugadores = await window.api.getJugadores();

  renderJugadores();
  poblarSelect();

  // eventos
  document.getElementById("btnNuevaAsistencia")
    ?.addEventListener("click", abrirNueva);

  document.getElementById("btnGuardarNueva")
    ?.addEventListener("click", guardarNueva);

  document.getElementById("btnGuardar")
    ?.addEventListener("click", guardarEdit);

  document.querySelectorAll(".btn-cerrar").forEach(b =>
    b.addEventListener("click", cerrar)
  );
});

/* =========================
   RENDER JUGADORES
========================= */
function renderJugadores() {
  const cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">
      <div>
        <b>${j.dni} - ${j.nombre}</b>
        <div style="opacity:.7">${j.apodo || "-"}</div>
      </div>

      <button onclick="ver('${j.id}')">👁 Ver</button>
    </div>
  `).join("");
}

/* =========================
   SELECT NUEVA ASISTENCIA
========================= */
function poblarSelect() {
  const sel = document.getElementById("nuevoJugadorSelect");

  sel.innerHTML =
    `<option value="">Seleccionar jugador</option>` +
    jugadores.map(j => `
      <option value="${j.id}">
        ${j.dni} - ${j.nombre} (${j.apodo || "-"})
      </option>
    `).join("");
}

/* =========================
   NUEVA ASISTENCIA
========================= */
function abrirNueva() {
  cerrar();

  document.getElementById("modalNuevaAsistencia").classList.add("show");

  document.getElementById("nuevoSemana").value = 1;
  document.getElementById("nuevoFecha").value = hoy();

  resetChecks("nuevo");
  actualizarEstadoNuevo();
}

async function guardarNueva() {

  const jugadorId = document.getElementById("nuevoJugadorSelect").value;

  if (!jugadorId) return alert("Seleccioná jugador");

  const data = {
    jugadorId,
    semana: Number(document.getElementById("nuevoSemana").value),
    fechaSemana: document.getElementById("nuevoFecha").value,
    dia1: document.getElementById("nuevoDia1").checked,
    dia2: document.getElementById("nuevoDia2").checked,
    dia3: document.getElementById("nuevoDia3").checked,
    estado: getEstado("nuevo"),
    detalle: document.getElementById("nuevoDetalle").value
  };

  await window.api.addAsistencia(data);

  cerrar();
}

/* =========================
   VER HISTORIAL
========================= */
window.ver = async function(id) {

  const data = await window.api.getAsistenciaByJugador(id);
  const j = jugadores.find(x => x.id === id);

  const cont = document.getElementById("detalleJugador");

  cont.innerHTML = `
    <h3>${j.dni} - ${j.nombre}</h3>
    <p>${j.apodo || "-"}</p>
  `;

  cont.innerHTML += data.map(a => `
    <div class="card">
      <b>Semana ${a.semana}</b>
      <div>${a.estado}</div>

      <button onclick="editar('${a.id}')">✏️</button>
      <button onclick="eliminar('${a.id}')">🗑</button>
    </div>
  `).join("");

  document.getElementById("modalJugador").classList.add("show");
};

/* =========================
   EDITAR
========================= */
window.editar = async function(id) {

  const a = await window.api.getAsistenciaById(id);
  if (!a) return;

  editId = a.id;

  document.getElementById("editDni").value = a.dni || "";
  document.getElementById("editNombre").value = a.nombre || "";
  document.getElementById("editApodo").value = a.apodo || "";

  document.getElementById("semana").value = a.semana;
  document.getElementById("fechaSemana").value = a.fechaSemana || "";

  document.getElementById("dia1").checked = a.dia1;
  document.getElementById("dia2").checked = a.dia2;
  document.getElementById("dia3").checked = a.dia3;

  document.getElementById("estadoSemana").value = a.estado;
  document.getElementById("detalleSemana").value = a.detalle;

  document.getElementById("modalAsistencia").classList.add("show");
};

/* =========================
   GUARDAR EDIT
========================= */
async function guardarEdit() {

  const data = {
    id: editId,
    semana: Number(document.getElementById("semana").value),
    fechaSemana: document.getElementById("fechaSemana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked,
    estado: getEstado("edit"),
    detalle: document.getElementById("detalleSemana").value
  };

  await window.api.updateAsistencia(data);

  cerrar();
};

/* =========================
   ELIMINAR
========================= */
window.eliminar = async function(id) {

  if (!confirm("Eliminar?")) return;

  await window.api.deleteAsistencia(id);

  cerrar();
};

/* =========================
   ESTADO
========================= */
function getEstado(prefix) {

  const d1 = document.getElementById(prefix + "Dia1")?.checked;
  const d2 = document.getElementById(prefix + "Dia2")?.checked;
  const d3 = document.getElementById(prefix + "Dia3")?.checked;

  const total = [d1, d2, d3].filter(Boolean).length;

  if (total === 3) return "🟢 COMPLETO";
  if (total > 0) return "🟡 INCOMPLETO";
  return "🔴 NO ASISTIÓ";
}

/* =========================
   UTIL
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

function resetChecks(prefix) {
  document.getElementById(prefix + "Dia1").checked = false;
  document.getElementById(prefix + "Dia2").checked = false;
  document.getElementById(prefix + "Dia3").checked = false;
}

function hoy() {
  return new Date().toISOString().split("T")[0];
}
