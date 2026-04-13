const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let datos = { jugadores: [] };
let tab = "jugadores";

/* =========================
   FETCH SEGURO
========================= */
async function api(url, opt = {}) {
  let r = await fetch(url, opt);
  let text = await r.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("Respuesta inválida:", text);
    throw new Error("Error API");
  }const API = "https://script.google.com/macros/s/AKfycbxb7tQ25fZ7gfaRzEQiyDv52N02wMf9MCl_Cs5RlwYTYJnhAolVMVnDP6n_0RQEyBx9/exec";

let datos = { jugadores: [] };
let tab = "jugadores";

/* =========================
   FETCH SEGURO
========================= */
async function api(url, opt = {}) {
  let r = await fetch(url, opt);
  let text = await r.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("Respuesta inválida:", text);
    throw new Error("Error API");
  }
}

/* =========================
   CARGAR
========================= */
async function cargar() {

  showMsg("Cargando...", "loading");

  try {

    let jugadores = await getJugadores();

    datos.jugadores = jugadores;

    showMsg("OK", "success");
    render();

  } catch (e) {
    showMsg("Error Firebase", "error");
    console.error(e);
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

  let filtro = document.getElementById("buscar")?.value?.toLowerCase() || "";

  cont.innerHTML = lista
    .filter(j => {
      let nombre = get(j, 2).toLowerCase();
      let dni = get(j, 1);
      return nombre.includes(filtro) || dni.includes(filtro);
    })
    .map(j => {

      let dni = get(j, 1);
      let nombre = get(j, 2);
      let apodo = j.apodo || "";

      return `
        <div class="fila">

          <div class="avatar">${(nombre || "?").charAt(0)}</div>

          <div class="dato">
            <div>${nombre} ${apodo ? "(" + apodo + ")" : ""}</div>
            <div>DNI: ${dni}</div>
          </div>

          <div class="badge">${get(j, 4)}</div>

          <button class="btn btn-sec" onclick="ver('${dni}')">
            Ver
          </button>

        </div>
      `;
    }).join(""); // 👈 ESTE ERA EL ERROR
}

/* =========================
   FILTRO (ARREGLADO)
========================= */
document.getElementById("buscar").addEventListener("input", render);

/* =========================
   VER JUGADOR
========================= */
function ver(dni) {

  let j = (datos.jugadores || []).find(x => String(x.dni) === String(dni));

  if (!j) {
    showMsg("Jugador no encontrado", "error");
    return;
  }

  document.getElementById("detalle").innerHTML = `
    <p><b>DNI:</b> ${j.dni || "-"}</p>
    <p><b>Nombre:</b> ${j.nombre || "-"}</p>
    <p><b>Celular:</b> ${j.celular || "-"}</p>
    <p><b>Apodo:</b> ${j.apodo || "-"}</p>
    <p><b>Puesto 1:</b> ${j.puesto1 || "-"}</p>
    <p><b>Puesto 2:</b> ${j.puesto2 || "-"}</p>
    <p><b>Puesto 3:</b> ${j.puesto3 || "-"}</p>
    <p><b>Correo:</b> ${j.correo || "-"}</p>
  `;

  document.getElementById("modalVer").classList.add("show");
}

/* =========================
   NUEVO JUGADOR
========================= */
function abrirModal() {

  document.querySelectorAll("#modal input, #modal select")
    .forEach(e => e.value = "");

  document.getElementById("modal").classList.add("show");
}

/* =========================
   GUARDAR JUGADOR
========================= */
async function guardar() {

 let data = {
  dni: document.getElementById("dni").value,
  nombre: document.getElementById("nombre").value,
  apodo: document.getElementById("apodo").value, // 👈 NUEVO
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

    await guardarJugadorFirebase(data);

    showMsg("Jugador guardado", "success");

    cerrar();
    cargar(); // recarga lista

  } catch (e) {
    console.error(e);
    showMsg("Error guardando", "error");
  }
}

/* =========================
   ASISTENCIA
========================= */
function abrirAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");
  cargarSelectAsistencia();
  cargarTablaAsistencia();
}

/* =========================
   SELECT ASISTENCIA
========================= */
function cargarSelectAsistencia() {

  let sel = document.getElementById("selectJugadorAsistencia");

  sel.innerHTML =
    `<option value="">Seleccionar jugador</option>` +
    (datos.jugadores || []).map(j =>
      `<option value="${j.c2}">
        ${j.c2} - ${j.c3}
      </option>`
    ).join("");

  let semana = document.getElementById("semana");

  if (semana) {
    semana.innerHTML = "";
    for (let i = 1; i <= 40; i++) {
      semana.innerHTML += `<option value="${i}">Semana ${i}</option>`;
    }
  }
}

/* =========================
   TABLA ASISTENCIA
========================= */
async function cargarTablaAsistencia() {

  let cont = document.getElementById("tablaAsistencia");

  try {
    let r = await api(API + "?tipo=asistencia");

    let data = r.datos?.asistencia || [];

    cont.innerHTML = data.map(a => {

      let estado =
        a.c4 == 1 && a.c5 == 1 && a.c6 == 1 ? "🟢 Completo" :
        (a.c4 == 1 || a.c5 == 1 || a.c6 == 1) ? "🟡 Incompleto" :
        "🔴 No asistió";

      return `
        <div class="fila">
          <div><b>${a.c2}</b> - ${a.c1}</div>
          <div>Semana ${a.c3}</div>
          <div>${estado}</div>
        </div>
      `;
    }).join("");

  } catch (e) {
    cont.innerHTML = "Error cargando asistencia";
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
   INIT
========================= */
window.onload = cargar;

window.abrirModal = abrirModal;
window.cerrar = cerrar;
window.guardar = guardar;
window.ver = ver;
window.cargar = cargar;
}

/* =========================
   CARGAR
========================= */
async function cargar() {

  showMsg("Cargando...", "loading");

  try {

    let jugadores = await getJugadores();

    datos.jugadores = jugadores;

    showMsg("OK", "success");
    render();

  } catch (e) {
    showMsg("Error Firebase", "error");
    console.error(e);
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

  let filtro = document.getElementById("buscar")?.value?.toLowerCase() || "";

  cont.innerHTML = lista
    .filter(j => {
      let nombre = get(j, 2).toLowerCase();
      let dni = get(j, 1);
      return nombre.includes(filtro) || dni.includes(filtro);
    })
    .map(j => {

      let dni = get(j, 1);
      let nombre = get(j, 2);
        let apodo = j.apodo || "";

     return `
  <div class="fila">

    <div class="avatar">${(nombre || "?").charAt(0)}</div>

    <div class="dato">
      <div>${nombre} ${apodo ? "(" + apodo + ")" : ""}</div>
      <div>DNI: ${dni}</div>
    </div>

    <div class="badge">${get(j, 4)}</div>

    <button class="btn btn-sec" onclick="ver('${dni}')">
      Ver
    </button>

  </div>
`;
}

/* =========================
   FILTRO (ARREGLADO)
========================= */
document.getElementById("buscar").addEventListener("input", render);

/* =========================
   VER JUGADOR
========================= */
function ver(dni) {

  let j = (datos.jugadores || []).find(x => String(x.dni) === String(dni));

  if (!j) {
    showMsg("Jugador no encontrado", "error");
    return;
  }

  document.getElementById("detalle").innerHTML = `
    <p><b>DNI:</b> ${j.dni || "-"}</p>
    <p><b>Nombre:</b> ${j.nombre || "-"}</p>
    <p><b>Celular:</b> ${j.celular || "-"}</p>
    <p><b>Apodo:</b> ${j.apodo || "-"}</p>
    <p><b>Puesto 1:</b> ${j.puesto1 || "-"}</p>
    <p><b>Puesto 2:</b> ${j.puesto2 || "-"}</p>
    <p><b>Puesto 3:</b> ${j.puesto3 || "-"}</p>
    <p><b>Correo:</b> ${j.correo || "-"}</p>
  `;

  document.getElementById("modalVer").classList.add("show");
}

/* =========================
   NUEVO JUGADOR
========================= */
function abrirModal() {

  document.querySelectorAll("#modal input, #modal select")
    .forEach(e => e.value = "");

  document.getElementById("modal").classList.add("show");
}

/* =========================
   GUARDAR JUGADOR
========================= */
async function guardar() {

 let data = {
  dni: document.getElementById("dni").value,
  nombre: document.getElementById("nombre").value,
  apodo: document.getElementById("apodo").value, // 👈 NUEVO
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

    await guardarJugadorFirebase(data);

    showMsg("Jugador guardado", "success");

    cerrar();
    cargar(); // recarga lista

  } catch (e) {
    console.error(e);
    showMsg("Error guardando", "error");
  }
}

/* =========================
   ASISTENCIA
========================= */
function abrirAsistencia() {
  document.getElementById("modalAsistencia").classList.add("show");
  cargarSelectAsistencia();
  cargarTablaAsistencia();
}

/* =========================
   SELECT ASISTENCIA
========================= */
function cargarSelectAsistencia() {

  let sel = document.getElementById("selectJugadorAsistencia");

  sel.innerHTML =
    `<option value="">Seleccionar jugador</option>` +
    (datos.jugadores || []).map(j =>
      `<option value="${j.c2}">
        ${j.c2} - ${j.c3}
      </option>`
    ).join("");

  let semana = document.getElementById("semana");

  if (semana) {
    semana.innerHTML = "";
    for (let i = 1; i <= 40; i++) {
      semana.innerHTML += `<option value="${i}">Semana ${i}</option>`;
    }
  }
}

/* =========================
   TABLA ASISTENCIA
========================= */
async function cargarTablaAsistencia() {

  let cont = document.getElementById("tablaAsistencia");

  try {
    let r = await api(API + "?tipo=asistencia");

    let data = r.datos?.asistencia || [];

    cont.innerHTML = data.map(a => {

      let estado =
        a.c4 == 1 && a.c5 == 1 && a.c6 == 1 ? "🟢 Completo" :
        (a.c4 == 1 || a.c5 == 1 || a.c6 == 1) ? "🟡 Incompleto" :
        "🔴 No asistió";

      return `
        <div class="fila">
          <div><b>${a.c2}</b> - ${a.c1}</div>
          <div>Semana ${a.c3}</div>
          <div>${estado}</div>
        </div>
      `;
    }).join("");

  } catch (e) {
    cont.innerHTML = "Error cargando asistencia";
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
   INIT
========================= */
window.onload = cargar;
