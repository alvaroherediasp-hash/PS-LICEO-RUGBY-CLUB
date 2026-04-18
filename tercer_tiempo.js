let jugadores = [];
let partidos = [];

let jugadorActual = null;
let partidoActual = null;

// 👉 navegación
let inicioPartidos = 0;
const partidosPorVista = 3;

/* =========================
   INIT
========================= */
window.addEventListener("load", async () => {

  await esperarAPI(); // 🔥 clave

  configurarEventos();
  await cargarTodo();
});

/* =========================
   ESPERAR API
========================= */
async function esperarAPI() {
  while (!window.api) {
    console.log("⏳ Esperando API...");
    await new Promise(r => setTimeout(r, 100));
  }
  console.log("✅ API lista");
}

/* =========================
   EVENTOS
========================= */
function configurarEventos() {

  document.getElementById("btnNuevoPartido")
    ?.addEventListener("click", nuevoPartido);

  document.getElementById("btnGuardarPartido")
    ?.addEventListener("click", guardarPartido);

  document.getElementById("btnGuardarPago")
    ?.addEventListener("click", guardarPago);

  document.getElementById("btnAnterior")
    ?.addEventListener("click", () => {
      if (inicioPartidos > 0) {
        inicioPartidos -= partidosPorVista;
        renderTabla();
      }
 document.getElementById("buscadorJugadores")
  ?.addEventListener("input", (e) => {
    filtroJugador = e.target.value.toLowerCase();
    renderTabla();
  });
    });

  document.getElementById("btnSiguiente")
    ?.addEventListener("click", () => {
      if (inicioPartidos + partidosPorVista < partidos.length) {
        inicioPartidos += partidosPorVista;
        renderTabla();
      }
    });
}

/* =========================
   CARGAR TODO
========================= */
async function cargarTodo() {
  try {
    jugadores = await window.api.getJugadores();
    partidos = await window.api.getPartidos();

    irAUltimaPagina();
    renderTabla();
  } catch (err) {
    console.error("Error cargando datos:", err);
  }
}

/* =========================
   PAGINACIÓN
========================= */
function irAUltimaPagina() {
  if (partidos.length <= partidosPorVista) {
    inicioPartidos = 0;
    return;
  }

  inicioPartidos =
    Math.floor((partidos.length - 1) / partidosPorVista) * partidosPorVista;
}

/* =========================
   PARTIDOS
========================= */
function nuevoPartido() {
  document.getElementById("fechaPartido").value =
    new Date().toISOString().split("T")[0];

  document.getElementById("tituloPartido").value = "";

  document.getElementById("modalPartido").showModal();
}

async function guardarPartido() {
  const fecha = document.getElementById("fechaPartido").value;
  const titulo = document.getElementById("tituloPartido").value;

  if (!fecha || !titulo) {
    alert("Completá fecha y título");
    return;
  }

  try {
    await window.api.addPartido({
      fecha,
      titulo,
      pagos: {}
    });

    document.getElementById("modalPartido").close();
    await cargarTodo();

  } catch (err) {
    console.error(err);
    alert("Error al guardar partido");
  }
}

async function eliminarPartido(partidoId) {
  const ok = confirm("¿Eliminar este partido?");
  if (!ok) return;

  try {
    await window.api.deletePartido(partidoId);
    await cargarTodo();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar partido");
  }
}

/* =========================
   PAGOS
========================= */
function abrirPago(jugadorId, partidoId) {

  jugadorActual = jugadorId;
  partidoActual = partidoId;

  const jugador = jugadores.find(j => j.id === jugadorId);
  const partido = partidos.find(p => p.id === partidoId);

  document.getElementById("infoJugador").innerText =
    `${jugador?.nombre || ""} (${jugador?.dni || ""})`;

  const pago = partido?.pagos?.[jugadorId];

  document.getElementById("importePago").value =
    pago?.importe || "";

  document.getElementById("formaPago").value =
    pago?.forma || "efectivo";

  document.getElementById("modalPago").showModal();
}

async function guardarPago() {

  const importe = parseFloat(document.getElementById("importePago").value);
  const forma = document.getElementById("formaPago").value;

  if (!importe || importe <= 0) {
    alert("Ingresá un importe válido");
    return;
  }

  try {
    const partido = partidos.find(p => p.id === partidoActual);

    if (!partido.pagos) partido.pagos = {};

    partido.pagos[jugadorActual] = {
      pagado: true,
      importe,
      forma
    };

    await window.api.updatePago(partidoActual, partido.pagos);

    document.getElementById("modalPago").close();
    await cargarTodo();

  } catch (err) {
    console.error(err);
    alert("Error al guardar pago");
  }
}

/* =========================
   RENDER
========================= */
function renderTabla() {

  const contenedor = document.getElementById("tablaJugadores");
  if (!contenedor) return;

  const visibles = partidos.slice(
    inicioPartidos,
    inicioPartidos + partidosPorVista
  );

  let html = "<table border='1'><thead><tr><th>Jugador</th>";

  visibles.forEach(p => {
    html += `
      <th style="position:relative;">
        <button onclick="eliminarPartido('${p.id}')"
          style="position:absolute;top:2px;right:2px;background:red;color:white;border:none;">
          ❌
        </button>
        ${p.titulo || 'Sin título'}<br>
        <small>${p.fecha}</small>
      </th>
    `;
  });

  html += "</tr></thead><tbody>";

  const jugadoresFiltrados = jugadores.filter(j => {
  const nombre = (j.nombre || "").toLowerCase();
  const dni = (j.dni || "").toString();

  return nombre.includes(filtroJugador) || dni.includes(filtroJugador);
});

jugadoresFiltrados.forEach(j => {

  // TOTAL
  html += "<tr><td><b>Total</b></td>";

  visibles.forEach(p => {
    let total = 0;

    if (p.pagos) {
      Object.values(p.pagos).forEach(x => {
        if (x?.importe) total += x.importe;
      });
    }

    html += `<td><b>$${total}</b></td>`;
  });

  html += "</tr></tbody></table>";

  contenedor.innerHTML = html;
}

/* =========================
   GLOBAL (para botones HTML)
========================= */
window.abrirPago = abrirPago;
window.eliminarPartido = eliminarPartido;
