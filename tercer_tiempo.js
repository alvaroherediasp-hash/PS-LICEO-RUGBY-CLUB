let jugadores = [];
let partidos = [];

// =========================
// CARGAR TODO (Firebase)
// =========================
async function cargarTodo() {
  jugadores = await window.api.getJugadores();
  partidos = await window.api.getPartidos();

  renderTabla();
}

// =========================
// NUEVO PARTIDO (Firebase)
// =========================
async function nuevoPartido() {
  const fecha = new Date().toISOString().split("T")[0];

  await window.api.addPartido({
    fecha,
    pagos: {}
  });

  cargarTodo();
}

// =========================
// RENDER TABLA
// =========================
function renderTabla() {

  if (partidos.length === 0) {
    document.getElementById("tablaJugadores").innerHTML =
      "<p>No hay partidos. Creá uno con 'Nuevo Partido'</p>";
    return;
  }

  let html = "<table><thead><tr><th>Jugador</th>";

  partidos.forEach(p => {
    html += `<th>${p.fecha}</th>`;
  });

  html += "</tr></thead><tbody>";

  jugadores.forEach(j => {
    html += `<tr><td>${j.nombre} (${j.dni})</td>`;

    partidos.forEach(p => {

      const pago = p.pagos?.[j.id];

      html += `
        <td>
          <button 
            class="btn-pago"
            style="background:${pago ? 'green' : 'red'}"
            onclick="pagar('${j.id}','${p.id}')">
            ${pago ? 'Pagado' : 'Debe'}
          </button>
        </td>
      `;
    });

    html += "</tr>";
  });

  html += "</tbody></table>";

  document.getElementById("tablaJugadores").innerHTML = html;
}

// =========================
// PAGAR (Firebase)
// =========================
async function pagar(jugadorId, partidoId) {

  const partido = partidos.find(p => p.id === partidoId);

  if (!partido.pagos) partido.pagos = {};

  // toggle
  partido.pagos[jugadorId] = !partido.pagos[jugadorId];

  await window.api.updatePago(partidoId, partido.pagos);

  cargarTodo();
}

// =========================
// EVENTOS
// =========================
document.getElementById("btnNuevoPartido")
  .addEventListener("click", nuevoPartido);

// =========================
// INIT
// =========================
window.addEventListener("load", () => {
  cargarTodo();
});
