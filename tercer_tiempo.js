let jugadores = [];
let partidos = [];

let jugadorActual = null;
let partidoActual = null;

// 👉 navegación
let inicioPartidos = 0;
const partidosPorVista = 3;

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

  irAUltimaPagina();
renderTabla();
}
function irAUltimaPagina() {

  if (partidos.length <= partidosPorVista) {
    inicioPartidos = 0;
    return;
  }

  // calcular última "página"
  inicioPartidos = Math.floor((partidos.length - 1) / partidosPorVista) * partidosPorVista;
}

// =========================
// NUEVO PARTIDO
// =========================
function nuevoPartido() {
  document.getElementById("fechaPartido").value =
    new Date().toISOString().split("T")[0];

  document.getElementById("tituloPartido").value = "";

  document.getElementById("modalPartido").showModal();
}

// =========================
// GUARDAR PARTIDO
// =========================
async function guardarPartido() {

  const fecha = document.getElementById("fechaPartido").value;
  const titulo = document.getElementById("tituloPartido").value;

  if (!fecha || !titulo) {
    alert("Completá fecha y título");
    return;
  }

  await window.api.addPartido({
    fecha,
    titulo,
    pagos: {}
  });

  document.getElementById("modalPartido").close();
  await cargarTodo();
irAUltimaPagina();
renderTabla();
}

// =========================
// ABRIR MODAL PAGO
// =========================
function abrirPago(jugadorId, partidoId) {

  jugadorActual = jugadorId;
  partidoActual = partidoId;

  const jugador = jugadores.find(j => j.id === jugadorId);

  document.getElementById("infoJugador").innerText =
    `${jugador.nombre} (${jugador.dni})`;

  const partido = partidos.find(p => p.id === partidoId);
  const pagoExistente = partido?.pagos?.[jugadorId];

  document.getElementById("importePago").value = pagoExistente?.importe || "";
  document.getElementById("formaPago").value = pagoExistente?.forma || "efectivo";

  document.getElementById("modalPago").showModal();
}

// =========================
// GUARDAR PAGO
// =========================
async function guardarPago() {

  const importe = parseFloat(document.getElementById("importePago").value);
  const forma = document.getElementById("formaPago").value;

  if (!importe || importe <= 0) {
    alert("Ingresá un importe válido");
    return;
  }

  const partido = partidos.find(p => p.id === partidoActual);

  if (!partido.pagos) partido.pagos = {};

  partido.pagos[jugadorActual] = {
    pagado: true,
    importe: importe,
    forma: forma
  };

  await window.api.updatePago(partidoActual, partido.pagos);

  document.getElementById("modalPago").close();
  cargarTodo();
}

// =========================
// RENDER
// =========================
function renderTabla() {

  // 👇 cortar partidos visibles
  const partidosVisibles = partidos.slice(
    inicioPartidos,
    inicioPartidos + partidosPorVista
  );

  let html = "<table border='1'><thead><tr><th>Jugador</th>";

  // ENCABEZADOS
  partidosVisibles.forEach(p => {
    html += `
      <th>
        ${p.titulo || 'Sin título'}<br>
        <small>${p.fecha}</small>
      </th>
    `;
  });

  html += "</tr></thead><tbody>";

  // FILAS
  jugadores.forEach(j => {

    html += `<tr><td><b>${j.nombre}</b><br><small>${j.dni}</small></td>`;

    partidosVisibles.forEach(p => {

      const pago = p.pagos?.[j.id];
      const pagado = pago?.pagado;

      html += `
        <td>
          <button 
            style="
              background:${pagado ? (pago.forma === 'transferencia' ? '#007bff' : 'green') : 'red'};
              color:white;
              border:none;
              padding:5px;
              cursor:pointer;
            "
            onclick="abrirPago('${j.id}','${p.id}')">
            ${pagado ? '$' + pago.importe : 'Debe'}
          </button>
        </td>
      `;
    });

    html += "</tr>";
  });

  // TOTAL
  html += "<tr><td><b>Total</b></td>";

  partidosVisibles.forEach(p => {

    let total = 0;

    if (p.pagos) {
      Object.values(p.pagos).forEach(pago => {
        if (pago?.importe) total += pago.importe;
      });
    }

    html += `<td><b>$${total}</b></td>`;
  });

  html += "</tr>";

  html += "</tbody></table>";

  document.getElementById("tablaJugadores").innerHTML = html;
}

// =========================
// EVENTOS
// =========================
window.addEventListener("load", () => {

  document.getElementById("btnNuevoPartido")
    .addEventListener("click", nuevoPartido);

  document.getElementById("btnGuardarPartido")
    .addEventListener("click", guardarPartido);

  document.getElementById("btnGuardarPago")
    .addEventListener("click", guardarPago);

  // 👉 navegación
  document.getElementById("btnAnterior").addEventListener("click", () => {
    if (inicioPartidos > 0) {
      inicioPartidos -= partidosPorVista;
      renderTabla();
    }
  });

  document.getElementById("btnSiguiente").addEventListener("click", () => {
    if (inicioPartidos + partidosPorVista < partidos.length) {
      inicioPartidos += partidosPorVista;
      renderTabla();
    }
  });

  cargarTodo();
});

// 👉 necesario por type="module"
window.abrirPago = abrirPago;
