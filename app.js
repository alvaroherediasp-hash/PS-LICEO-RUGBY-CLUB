let datos = { jugadores: [] };

/* =========================
   CARGAR
========================= */
async function cargar() {
  showMsg("Cargando...", "loading");

  try {
    datos.jugadores = await window.getJugadores();
    render();
    showMsg("OK", "success");
  } catch (e) {
    console.error(e);
    showMsg("Error Firebase", "error");
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
        <div>${j.nombre} ${j.apodo ? "(" + j.apodo + ")" : ""}</div>
        <div>DNI: ${j.dni}</div>
      </div>
    `).join("");
}

/* =========================
   MODAL
========================= */
function abrirModal() {
  document.getElementById("modal").classList.add("show");
}

function cerrar() {
  document.getElementById("modal").classList.remove("show");
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
    return showMsg("Completa DNI y Nombre", "error");
  }

  try {
    await window.guardarJugadorFirebase(data);
    cerrar();
    cargar();
  } catch (e) {
    console.error(e);
    showMsg("Error guardando", "error");
  }
}

/* =========================
   UI
========================= */
function showMsg(msg, tipo) {
  let e = document.getElementById("estado");
  e.innerText = msg;
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

}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  initEvents();
  cargar();
});
