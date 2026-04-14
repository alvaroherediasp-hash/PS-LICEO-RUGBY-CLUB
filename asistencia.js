let jugadores = [];

window.addEventListener("DOMContentLoaded", async () => {
  // Esperar a que firebase.js (module) exponga window.api
  while (!window.api) {
    await new Promise(r => setTimeout(r, 200));
  }

  jugadores = await window.api.getJugadores();
  renderJugadores();
  poblarSelectJugadores();

  document.getElementById("btnGuardarNueva")
    ?.addEventListener("click", guardarNuevaAsistencia);

  document.getElementById("btnGuardar")
    ?.addEventListener("click", guardarAsistencia);

  // Cerrar modales con botones btn-cerrar
  document.querySelectorAll(".btn-cerrar").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
    });
  });

  document.getElementById("btnNuevaAsistencia")
    ?.addEventListener("click", () => {
      document.getElementById("modalNuevaAsistencia").classList.add("show");
    });
});

function renderJugadores() {
  const cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">
      <b>${j.nombre}</b>
      <button onclick="ver('${j.id}')">Ver</button>
    </div>
  `).join("");
}

function poblarSelectJugadores() {
  const sel = document.getElementById("nuevoJugadorSelect");
  if (!sel) return;

  sel.innerHTML = `<option value="">Seleccionar jugador...</option>` +
    jugadores.map(j => `<option value="${j.id}">${j.nombre}</option>`).join("");
}

window.ver = async function(id) {
  const data = await window.api.getAsistenciaByJugador(id);

  const cont = document.getElementById("detalleJugador");

  cont.innerHTML = data.length
    ? data.map(a => `
        <div class="card">
          Semana ${a.semana} - ${a.estado || "-"}
          <button onclick="editar('${a.id}')">✏️</button>
          <button onclick="eliminar('${a.id}')">🗑</button>
        </div>
      `).join("")
    : "<p>Sin registros de asistencia</p>";

  document.getElementById("modalJugador").classList.add("show");
};

window.editar = async function(id) {
  const a = await window.api.getAsistenciaById(id);
  if (!a) return;

  window.editId = a.id;

  // Poblar campos del modal editar
  document.getElementById("semana").innerHTML =
    Array.from({length: 30}, (_, i) => `<option value="${i+1}" ${a.semana == i+1 ? "selected" : ""}>Semana ${i+1}</option>`).join("");

  document.getElementById("dia1").checked = !!a.dia1;
  document.getElementById("dia2").checked = !!a.dia2;
  document.getElementById("dia3").checked = !!a.dia3;
  document.getElementById("estadoSemana").value = a.estado || "";
  document.getElementById("detalleSemana").value = a.detalle || "";

  document.getElementById("modalAsistencia").classList.add("show");
};

async function guardarAsistencia() {

  const data = {
    id: window.editId,
    semana: Number(document.getElementById("semana").value),
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked,
    estado: document.getElementById("estadoSemana").value,
    detalle: document.getElementById("detalleSemana").value
  };

  await window.api.updateAsistencia(data);

  alert("✔ Actualizado");
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
}

async function guardarNuevaAsistencia() {

  const jugadorId = document.getElementById("nuevoJugadorSelect").value; // FIX: era "nuevoJugador"

  if (!jugadorId) {
    alert("⚠️ Seleccioná un jugador");
    return;
  }

  const data = {
    jugadorId,
    semana: Number(document.getElementById("nuevoSemana").value),
    dia1: document.getElementById("nuevoDia1").checked,
    dia2: document.getElementById("nuevoDia2").checked,
    dia3: document.getElementById("nuevoDia3").checked,
    estado: document.getElementById("nuevoEstado").value,
    detalle: document.getElementById("nuevoDetalle").value
  };

  await window.api.addAsistencia(data);

  alert("✔ Guardado");
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
}

window.eliminar = async function(id) {
  if (!confirm("¿Eliminar registro?")) return;

  await window.api.deleteAsistencia(id);

  alert("🗑 Eliminado");
};
