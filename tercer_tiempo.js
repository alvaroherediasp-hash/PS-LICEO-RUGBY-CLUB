
let jugadores = [];
let partidos = [];

// Cargar jugadores desde Firebase
async function cargarJugadores() {
  const db = window.db;
  const snapshot = await db.collection("jugadores").get();

  jugadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  renderTabla();
}

// Crear nuevo partido
function nuevoPartido() {
  const fecha = new Date().toLocaleDateString();
  partidos.push({ fecha });
  renderTabla();
}

// Render tabla
function renderTabla() {
  let html = "<table><thead><tr><th>Jugador</th>";

  partidos.forEach((p, i) => {
    html += `<th>${p.fecha}</th>`;
  });

  html += "</tr></thead><tbody>";

  jugadores.forEach(j => {
    html += `<tr><td>${j.nombre} (${j.dni})</td>`;

    partidos.forEach((p, i) => {
      html += `<td><button class='btn-pago' onclick="pagar('${j.id}', ${i})">Pago</button></td>`;
    });

    html += "</tr>";
  });

  html += "</tbody></table>";

  document.getElementById("tablaJugadores").innerHTML = html;
}

// Acción pagar
function pagar(jugadorId, partidoIndex) {
  alert("Pago registrado para jugador " + jugadorId + " en partido " + partidoIndex);
}

// Eventos

document.getElementById("btnNuevoPartido").addEventListener("click", nuevoPartido);

// Inicializar
cargarJugadores();
