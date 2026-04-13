let jugadores = [];
let jugadorActual = null;

/* =========================
   INIT
========================= */
window.onload = async () => {
  jugadores = await window.getJugadores();
  renderJugadores();
  cargarSemanas();
};

/* =========================
   TABLA JUGADORES
========================= */
function renderJugadores() {

  let cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">
      <div>
        <b>${j.nombre}</b>
        <div>DNI: ${j.dni}</div>
      </div>

      <button onclick="verJugador('${j.id}')">
        👁 Ver
      </button>
    </div>
  `).join("");
}

/* =========================
   MODAL
========================= */
function abrirModalAsistencia() {

  document.getElementById("modalAsistencia").classList.add("show");

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre}
    </option>
  `).join("");

  // 🔥 AUTO HOY
  setFechaHoy();
}

/* =========================
   FECHA HOY
========================= */
function setFechaHoy() {
  let hoy = new Date();
  document.getElementById("fechaSemana").value =
    hoy.toISOString().split("T")[0];
}

/* =========================
   SEMANAS PRO (CON FECHA)
========================= */
function cargarSemanas() {

  let sel = document.getElementById("semana");
  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }

  // 🔥 EVENTO AUTOMÁTICO
  sel.addEventListener("change", () => {
    let semana = sel.value;
    document.getElementById("fechaSemana").value =
      getFechaPorSemana(semana);
  });

  // default
  sel.value = 1;
  document.getElementById("fechaSemana").value =
    getFechaPorSemana(1);
}

/* =========================
   CALCULAR LUNES DE SEMANA
========================= */
function getFechaPorSemana(semana) {

  let año = new Date().getFullYear();

  let fecha = new Date(año, 0, 1 + (semana - 1) * 7);

  let dia = fecha.getDay();
  let diff = (dia <= 1 ? 1 - dia : 8 - dia);

  fecha.setDate(fecha.getDate() + diff);

  return fecha.toISOString().split("T")[0];
}

/* =========================
   ESTADO AUTOMÁTICO PRO
========================= */
function actualizarEstado() {

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let d3 = document.getElementById("dia3").checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  document.getElementById("estadoSemana").value = estado;
}

// 🔥 FIX EVENTOS (ANTES ESTABA MAL)
["dia1","dia2","dia3"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", actualizarEstado);
});

/* =========================
   GUARDAR PRO
========================= */
async function guardarAsistencia() {

  let id = document.getElementById("jugadorSelect").value;

  if (!id) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == id);

  let semana = Number(document.getElementById("semana").value);
  let fechaInput = document.getElementById("fechaSemana").value;

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let d3 = document.getElementById("dia3").checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  let data = {
    jugadorId: id,
    dni: jugador.dni,
    nombre: jugador.nombre,
    semana: semana,

    // 🔥 FIX FIREBASE
    fechaSemana: new Date(fechaInput),
    createdAt: new Date(),

    dia1: d1,
    dia2: d2,
    dia3: d3,

    estado: estado,
    detalle: document.getElementById("detalleSemana")?.value || ""
  };

  try {

    await window.guardarAsistenciaFirebase(data);

    alert("✅ Asistencia guardada correctamente");

    cerrar();

  } catch (e) {
    console.error(e);
    alert("❌ Error guardando");
  }
}

/* =========================
   VER JUGADOR PRO
========================= */
window.verJugador = async function(id) {

  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  if (!data.length) {
    cont.innerHTML = "<p>Sin asistencia</p>";
  } else {

    cont.innerHTML = data.map(a => {

      let fecha = a.fechaSemana?.toDate
        ? a.fechaSemana.toDate().toLocaleDateString()
        : a.fechaSemana || "-";

      return `
        <div class="card">
          <b>Semana ${a.semana}</b>
          <div>📅 ${fecha}</div>
          <div>
            Día1: ${a.dia1 ? "✔" : "-"} |
            Día2: ${a.dia2 ? "✔" : "-"} |
            Partido: ${a.dia3 ? "✔" : "-"}
          </div>
          <div>${a.estado}</div>
          <div>${a.detalle || ""}</div>
        </div>
      `;
    }).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
}

/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
