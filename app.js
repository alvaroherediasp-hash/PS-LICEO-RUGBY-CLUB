let datos = { jugadores: [] };
let jugadorActual = null;

/* =========================
   CARGAR
========================= */
async function cargar() {
  showMsg("⏳ Cargando jugadores...");

  try {
    datos.jugadores = await window.api.getJugadores(); // FIX: era window.getJugadores()
    render();
    showMsg("✅ Datos actualizados");
  } catch (e) {
    console.error(e);
    showMsg("❌ Error Firebase");
  }
}

/* =========================
   RENDER SEGURO
========================= */
function render() {

  const cont = document.getElementById("tabla");
  if (!cont) return;

  const filtroInput = document.getElementById("buscar");
  const filtro = (filtroInput?.value || "").toLowerCase();

  const lista = datos.jugadores.filter(j =>
    (j.nombre || "").toLowerCase().includes(filtro) ||
    (j.dni || "").includes(filtro)
  );

  if (!lista.length) {
    cont.innerHTML = `<div style="opacity:0.6">No hay jugadores</div>`;
    return;
  }

  cont.innerHTML = lista.map(j => `
    <div class="fila">
      <div>
        <b>${j.nombre}</b>
        ${j.apodo ? `<span style="opacity:.6">(${j.apodo})</span>` : ""}
        <div style="font-size:12px;opacity:.6">DNI: ${j.dni}</div>
      </div>

      <div class="acciones">
        <button onclick="verJugador('${j.id}')">👁 Ver</button>
      </div>
    </div>
  `).join("");
}

/* =========================
   VER JUGADOR
========================= */
window.verJugador = function (id) {

  const j = datos.jugadores.find(x => x.id == id);
  if (!j) return;

  jugadorActual = j;

  document.getElementById("detalle").innerHTML = `
    <p><b>DNI:</b> ${j.dni}</p>
    <p><b>Nombre:</b> ${j.nombre}</p>
    <p><b>Apodo:</b> ${j.apodo || "-"}</p>
    <p><b>Celular:</b> ${j.celular || "-"}</p>
    <p><b>Correo:</b> ${j.correo || "-"}</p>
    <p><b>Puestos:</b> ${j.puesto1 || "-"} / ${j.puesto2 || "-"} / ${j.puesto3 || "-"}</p>
  `;

  document.getElementById("modalVer")?.classList.add("show");
};

/* =========================
   NUEVO
========================= */
function abrirModal() {

  jugadorActual = null;

  document.getElementById("tituloModal").innerText = "Nuevo Jugador";

  document.querySelectorAll("#modal input, #modal select")
    .forEach(e => e.value = "");

  document.getElementById("modal")?.classList.add("show");
}

/* =========================
   EDITAR (SEGURO)
========================= */
function editarJugador() {

  if (!jugadorActual) {
    alert("Primero selecciona un jugador");
    return;
  }

  cerrar();

  document.getElementById("tituloModal").innerText = "Editar Jugador";

  document.getElementById("dni").value = jugadorActual.dni || "";
  document.getElementById("nombre").value = jugadorActual.nombre || "";
  document.getElementById("apodo").value = jugadorActual.apodo || "";
  document.getElementById("celular").value = jugadorActual.celular || "";
  document.getElementById("correo").value = jugadorActual.correo || "";

  document.getElementById("p1").value = jugadorActual.puesto1 || "";
  document.getElementById("p2").value = jugadorActual.puesto2 || "";
  document.getElementById("p3").value = jugadorActual.puesto3 || "";

  document.getElementById("modal")?.classList.add("show");
}

/* =========================
   GUARDAR
========================= */
async function guardar() {

  const data = {
    dni: document.getElementById("dni").value,
    nombre: document.getElementById("nombre").value,
    apodo: document.getElementById("apodo").value,
    celular: document.getElementById("celular").value,
    correo: document.getElementById("correo").value,
    puesto1: document.getElementById("p1").value,
    puesto2: document.getElementById("p2").value,
    puesto3: document.getElementById("p3").value
  };

  if (!data.dni || !data.nombre) {
    return alert("⚠️ Completa DNI y Nombre");
  }

  try {

    if (jugadorActual?.id) {
      data.id = jugadorActual.id;
      await window.api.updateJugador(data); // FIX: era window.actualizarJugadorFirebase()
      alert("✏️ Jugador actualizado correctamente");
    } else {
      await window.api.addJugador(data); // FIX: era window.guardarJugadorFirebase()
      alert("✅ Jugador guardado correctamente");
    }

    cerrar();
    cargar();

  } catch (e) {
    console.error(e);
    alert("❌ Error guardando");
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminarJugador() {

  if (!jugadorActual?.id) {
    alert("No hay jugador seleccionado");
    return;
  }

  if (!confirm("¿Eliminar jugador?")) return;

  try {
    await window.api.deleteJugador(jugadorActual.id); // FIX: era window.eliminarJugadorFirebase()

    alert("🗑 Jugador eliminado");
    cerrar();
    cargar();

  } catch (e) {
    console.error(e);
    alert("❌ Error eliminando");
  }
}

/* =========================
   UI
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

function showMsg(msg) {
  const el = document.getElementById("estado");
  if (el) el.innerText = msg;
}

/* =========================
   INIT
========================= */
function initEvents() {

  document.getElementById("btnNuevo")?.addEventListener("click", abrirModal);
  document.getElementById("btnCerrar")?.addEventListener("click", cerrar);
  document.getElementById("btnGuardar")?.addEventListener("click", guardar);
  document.getElementById("btnReload")?.addEventListener("click", cargar);
  document.getElementById("buscar")?.addEventListener("input", render);

  document.getElementById("btnEditar")?.addEventListener("click", editarJugador);
  document.getElementById("btnEliminar")?.addEventListener("click", eliminarJugador);
}

document.getElementById("btnCerrarVer")
  ?.addEventListener("click", cerrar);

window.addEventListener("DOMContentLoaded", () => {
  initEvents();
  cargar();
});
