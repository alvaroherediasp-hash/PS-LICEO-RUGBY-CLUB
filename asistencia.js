let jugadores = [];

window.addEventListener("DOMContentLoaded", async () => {
  while (!window.api) {
    await new Promise(r => setTimeout(r, 200));
  }

  jugadores = await window.api.getJugadores();
  renderJugadores();

  document.getElementById("btnGuardarNueva")
    ?.addEventListener("click", guardarNuevaAsistencia);

  document.getElementById("btnGuardar")
    ?.addEventListener("click", guardarAsistencia);
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

window.ver = async function(id) {
  const data = await window.api.getAsistenciaByJugador(id);

  const cont = document.getElementById("detalleJugador");

  cont.innerHTML = data.map(a => `
    <div class="card">
      Semana ${a.semana} - ${a.estado}
      <button onclick="editar('${a.id}')">✏️</button>
      <button onclick="eliminar('${a.id}')">🗑</button>
    </div>
  `).join("");

  document.getElementById("modalJugador").classList.add("show");
};

window.editar = async function(id) {
  const a = await window.api.getAsistenciaById(id);

  window.editId = a.id;

  document.getElementById("modalAsistencia").classList.add("show");
};

async function guardarAsistencia() {

  const data = {
    id: window.editId,
    semana: Number(document.getElementById("semana").value),
    estado: document.getElementById("estadoSemana").value
  };

  await window.api.updateAsistencia(data);

  alert("✔ Actualizado");

  jugadores = await window.api.getJugadores();
};

async function guardarNuevaAsistencia() {

  const data = {
    jugadorId: document.getElementById("nuevoJugador").value,
    semana: Number(document.getElementById("nuevoSemana").value),
    estado: document.getElementById("nuevoEstado").value
  };

  await window.api.addAsistencia(data);

  alert("✔ Guardado");
}

window.eliminar = async function(id) {
  if (!confirm("Eliminar?")) return;

  await window.api.deleteAsistencia(id);

  alert("🗑 Eliminado");
};
