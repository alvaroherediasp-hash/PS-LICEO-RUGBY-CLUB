let jugadores = [];
let jugadorActual = null;

/* =========================
   INIT
========================= */
window.onload = async () => {
  try {
    jugadores = await window.getJugadores();
    console.log("Jugadores cargados:", jugadores);

    renderJugadores();
    cargarSemanas();

  } catch (e) {
    console.error(e);
    alert("Error Firebase al cargar jugadores");
  }
};

/* =========================
   TABLA JUGADORES
========================= */
function renderJugadores() {

  let cont = document.getElementById("tablaAsistencia");

  if (!jugadores.length) {
    cont.innerHTML = "<p>No hay jugadores cargados</p>";
    return;
  }

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">
      <div>
        <b>${j.nombre || "-"}</b>
        <div>DNI: ${j.dni || "-"}</div>
      </div>

      <button onclick="verJugador('${j.id}')">
        👁 Ver
      </button>
    </div>
  `).join("");
}

/* =========================
   MODAL (FIX PRINCIPAL)
========================= */
async function abrirModalAsistencia() {

  // 🔥 SI NO HAY JUGADORES → RECARGA
  if (!jugadores.length) {
    try {
      jugadores = await window.getJugadores();
    } catch (e) {
      console.error(e);
      alert("Error cargando jugadores");
      return;
    }
  }

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre} - ${j.dni}
    </option>
  `).join("");

  document.getElementById("modalAsistencia").classList.add("show");

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
   SEMANAS PRO
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
   CALCULAR LUNES
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
   ESTADO AUTOMÁTICO
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

// 🔥 FIX EVENTOS
["dia1","dia2","dia3"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", actualizarEstado);
});

/* =========================
   GUARDAR
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
    dni: jugador?.dni || "",
    nombre: jugador?.nombre || "",
    semana: semana,

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
   VER JUGADOR
========================= */
window.verJugador = async function(id) {

  let jugador = jugadores.find(j => j.id == id);

  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  if (!jugador) {
    cont.innerHTML = "<p>Error cargando jugador</p>";
    return;
  }

  cont.innerHTML = `
    <div class="card" style="margin-bottom:15px;">
      <h3>${jugador.nombre}</h3>
      <p><b>DNI:</b> ${jugador.dni}</p>
    </div>
  `;

  if (!data.length) {
    cont.innerHTML += "<p>Sin asistencia registrada</p>";
  } else {

    cont.innerHTML += data.map(a => `
      <div class="card" style="margin-bottom:10px;">

        <b>📅 Semana ${a.semana}</b>
        <div>Fecha: ${a.fechaSemana || "-"}</div>

        <div style="margin-top:5px;">
          Día1: ${a.dia1 ? "✔" : "✖"} |
          Día2: ${a.dia2 ? "✔" : "✖"} |
          Partido: ${a.dia3 ? "✔" : "✖"}
        </div>

        <div style="margin-top:5px;">
          ${a.estado}
        </div>

        <div style="margin-top:5px; font-size:13px; color:#555;">
          ${a.detalle || ""}
        </div>

      </div>
    `).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
};

/* =========================
   CERRAR
========================= */
function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}
