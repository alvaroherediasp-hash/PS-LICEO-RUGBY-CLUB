const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let datos = { jugadores: [] };
let tab = "jugadores";

/* =========================
   FETCH
========================= */
async function api(url, opt = {}) {
  let r = await fetch(url, opt);
  let text = await r.text();
  return JSON.parse(text);
}

/* =========================
   CARGAR
========================= */
async function cargar() {
  showMsg("Cargando...", "loading");

  try {
    let r = await api(API);

    datos = r.datos || { jugadores: [] };

    showMsg("OK", "success");
    render();

  } catch (e) {
    showMsg("Error conexión", "error");
  }
}

/* =========================
   HELPERS
========================= */
const get = (j, i) => String(j["c" + i] || "");

/* =========================
   RENDER
========================= */
function render() {
  if (tab !== "jugadores") return;

  let cont = document.getElementById("tabla");
  let lista = datos.jugadores || [];

  cont.innerHTML = lista.map(j => {

    let dni = get(j, 1);
    let nombre = get(j, 2);

    return `
      <div class="fila">

        <div class="avatar">${(nombre || "?").charAt(0)}</div>

        <div class="dato">
          <div>${nombre}</div>
          <div>DNI: ${dni}</div>
        </div>

        <div class="badge">${get(j, 4)}</div>

        <button class="btn btn-sec" onclick="ver('${dni}')">
          Ver
        </button>

      </div>
    `;
  }).join("");
}

/* =========================
   VER JUGADOR (FIX REAL)
========================= */
function ver(dni) {
  let j = (datos.jugadores || []).find(x => get(x, 1) === String(dni));

  if (!j) {
    showMsg("Jugador no encontrado", "error");
    return;
  }

  document.getElementById("detalle").innerHTML = `
    <p><b>DNI:</b> ${get(j,1)}</p>
    <p><b>Nombre:</b> ${get(j,2)}</p>
    <p><b>Celular:</b> ${get(j,3)}</p>
    <p><b>Puesto 1:</b> ${get(j,4)}</p>
    <p><b>Puesto 2:</b> ${get(j,5)}</p>
    <p><b>Puesto 3:</b> ${get(j,6)}</p>
    <p><b>Correo:</b> ${get(j,7)}</p>
  `;

  document.getElementById("modalVer").classList.add("show");
}

/* =========================
   NUEVO
========================= */
function abrirModal() {
  document.querySelectorAll("#modal input, #modal select")
    .forEach(e => e.value = "");

  document.getElementById("modal").classList.add("show");
}

/* =========================
   GUARDAR (FIX TOTAL)
========================= */
async function guardar() {

  let data = {
    accion: "guardar_jugador",
    dni: document.getElementById("dni").value,
    nombre: document.getElementById("nombre").value,
    celular: document.getElementById("celular").value,
    correo: document.getElementById("correo").value,
    puesto1: document.getElementById("p1").value,
    puesto2: document.getElementById("p2").value,
    puesto3: document.getElementById("p3").value
  };

  if (!data.dni || !data.nombre) {
    return showMsg("Completa DNI y Nombre", "error");
  }

  showMsg("Guardando...", "loading");

  try {
    let r = await api(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error(r.error || "Error");

    showMsg("Jugador guardado", "success");
    cerrar();
    cargar();

  } catch (e) {
    showMsg(e.message, "error");
  }
}

/* =========================
   UI
========================= */
function showMsg(msg, t) {
  let e = document.getElementById("estado");
  e.className = "estado show " + t;
  e.innerHTML = msg;

  if (t !== "loading") {
    setTimeout(() => e.className = "estado", 2000);
  }
}

function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

/* =========================
   TABS
========================= */
document.querySelectorAll(".tab").forEach(t => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    tab = t.dataset.tab;
    render();
  });
});

/* =========================
   INIT
========================= */
window.onload = cargar;

function abrirAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");
  cargarJugadoresEnAsistencia();
}
document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));