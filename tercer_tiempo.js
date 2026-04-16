let jugadores = [];
let partidos = [];

// =========================
// CARGAR TODO
// =========================
async function cargarTodo() {

  if (!window.api) {
    console.error("API no cargada");
    return;
  }

  jugadores = await window.api.getJugadores();
  partidos = await window.api.getPartidos();

  console.log("Jugadores:", jugadores);
  console.log("Partidos:", partidos);

  renderTabla();
}

// =========================
// NUEVO PARTIDO
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
// RENDER
// =========================
function renderTabla() {

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
// PAGAR
// =========================
window.pagar = async function(jugadorId, partidoId) {

  const partido = partidos.find(p => p.id === partidoId);

  if (!partido.pagos) partido.pagos = {};

  partido.pagos[jugadorId] = !partido.pagos[jugadorId];

  await window.api.updatePago(partidoId, partido.pagos);

  cargarTodo();
}

// =========================
// EVENTOS
// =========================
window.addEventListener("load", () => {

  document.getElementById("btnNuevoPartido")
    .addEventListener("click", nuevoPartido);

  cargarTodo();
});
