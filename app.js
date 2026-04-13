let datos = { jugadores: [] };
let jugadorActual = null;

/* =========================
   CARGAR
========================= */
async function cargar() {
  showMsg("Cargando...");

  try {
    datos.jugadores = await window.getJugadores();
    render();
    showMsg("OK");
  } catch (e) {
    console.error(e);
    showMsg("Error Firebase");
  }
}

/* =========================
   RENDER
========================= */
function render() {

  let cont = document.getElementById("tabla");
  let filtro = document.getElementById("buscar").value.toLowerCase();

  cont.innerHTML = datos.jugadores
    .filter(j =>
      (j.nombre || "").toLowerCase().includes(filtro) ||
      (j.dni || "").includes(filtro)
    )
    .map(j => `
      <div class="fila">

        <div>
          <b>${j.nombre}</b> ${j.apodo ? "(" + j.apodo + ")" : ""}
          <div>DNI: ${j.dni}</div>
        </div>

        <div class="acciones">
          <button onclick="verJugador('${j.id}')">👁 Ver</button>
        </div>

      </div>
    `).join("");
}

/* =========================
   VER
========================= */
window.verJugador = function(id) {

  let j = datos.jugadores.find(x => x.id == id);
  jugadorActual = j;

  document.getElementById("detalle").innerHTML = `
    <p><b>DNI:</b> ${j.dni}</p>
    <p><b>Nombre:</b> ${j.nombre}</p>
    <p><b>Apodo:</b> ${j.apodo || "-"}</p>
    <p><b>Celular:</b> ${j.celular || "-"}</p>
    <p><b>Correo:</b> ${j.correo || "-"}</p>
    <p><b>Puestos:</b> ${j.puesto1 || "-"} / ${j.puesto2 || "-"} / ${j.puesto3 || "-"}</p>
  `;

  document.getElementById("modalVer").classList.add("show");
}

/* =========================
   MODAL NUEVO
========================= */
function abrirModal() {

  jugadorActual = null;

  document.querySelectorAll("#modal input, #modal select")
    .forEach(e => e.value = "");

  document.getElementById("modal").classList.add("show");
}

/* =========================
   EDITAR
========================= */
function editarJugador() {

  cerrar();

  document.getElementById("dni").value = jugadorActual.dni;
  document.getElementById("nombre").value = jugadorActual.nombre;
  document.getElementById("apodo").value = jugadorActual.apodo;
  document.getElementById("celular").value = jugadorActual.celular;
  document.getElementById("correo").value = jugadorActual.correo;

  document.getElementById("p1").value = jugadorActual.puesto1;
  document.getElementById("p2").value = jugadorActual.puesto2;
  document.getElementById("p3").value = jugadorActual.puesto3;

  document.getElementById("modal").classList.add("show");
}

/* =========================
   GUARDAR
========================= */
async function guardar() {

  let data = {
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
    return showMsg("Completa DNI y Nombre");
  }

  try {

    if (jugadorActual) {
      data.id = jugadorActual.id; // 🔥 IMPORTANTE
      await window.actualizarJugadorFirebase(data);
    } else {
      await window.guardarJugadorFirebase(data);
    }

    cerrar();
    cargar();

  } catch (e) {
    console.error(e);
    showMsg("Error guardando");
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminarJugador() {

  if (!confirm("¿Eliminar jugador?")) return;

  try {
    await window.eliminarJugadorFirebase(jugadorActual.id); // 🔥 FIX
    cerrar();
    cargar();
  } catch (e) {
    console.error(e);
    showMsg("Error eliminando");
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
  document.getElementById("estado").innerText = msg;
}

/* =========================
   EVENTOS
========================= */
function initEvents() {

  document.getElementById("btnNuevo").addEventListener("click", abrirModal);
  document.getElementById("btnCerrar").addEventListener("click", cerrar);
  document.getElementById("btnGuardar").addEventListener("click", guardar);
  document.getElementById("btnReload").addEventListener("click", cargar);
  document.getElementById("buscar").addEventListener("input", render);

  document.getElementById("btnEditar")?.addEventListener("click", editarJugador);
  document.getElementById("btnEliminar")?.addEventListener("click", eliminarJugador);
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  initEvents();
  cargar();
});
