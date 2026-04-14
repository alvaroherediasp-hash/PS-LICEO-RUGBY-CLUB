let jugadores = [];
let jugadorActual = null;

window.onload = async () => {
  try {

    if (!window.getJugadores) {
      throw new Error("Firebase aún no inicializado");
    }

    jugadores = await window.getJugadores();

    // ✅ FIX IMPORTANTE
    window.asistencias = await window.getAsistencia();

    renderJugadores();
    cargarSemanas();
    initEventosChecks();

  } catch (e) {
    console.error("ERROR REAL:", e);
    alert("Error Firebase al cargar jugadores");
  }
};

/* =========================
   RENDER
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

      <button onclick="verJugador('${j.id}')">👁 Ver</button>
    </div>
  `).join("");
}

/* =========================
   ABRIR MODAL
========================= */
function abrirModalAsistencia() {

  cerrar(); // 🔥 IMPORTANTE

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre} - ${j.dni}
    </option>
  `).join("");

  limpiarFormulario();

  document.getElementById("tituloModalAsistencia").innerText = "Registrar asistencia";
  document.getElementById("modalAsistencia").classList.add("show");

  setFechaHoy();
  actualizarEstado();
}

/* =========================
   LIMPIAR
========================= */
function limpiarFormulario() {

  document.getElementById("asistenciaId").value = "";
  document.getElementById("jugadorSelect").value = "";

  // 🔥 NUEVOS CAMPOS
  document.getElementById("jugadorNombre").value = "";
  document.getElementById("jugadorDni").value = "";

  document.getElementById("detalleSemana").value = "";

  ["dia1", "dia2", "dia3"].forEach(id => {
    document.getElementById(id).checked = false;
  });
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
   SEMANAS
========================= */
function cargarSemanas() {

  let sel = document.getElementById("semana");

  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }

  sel.addEventListener("change", () => {
    actualizarFechaSemana();
  });

  sel.value = 1;
  actualizarFechaSemana();
}

function actualizarFechaSemana() {

  let semana = document.getElementById("semana").value;
  let fecha = getFechaPorSemana(semana);

  document.getElementById("fechaSemana").value = fecha;

  // 🔥 sincronizar label semana
  document.getElementById("semanaLabel").innerText = semana;

  document.getElementById("fechaSemanaLabel").innerText =
    "Inicio: " + new Date(fecha).toLocaleDateString("es-AR");
}
/* =========================
   FECHA SEMANA
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
   ESTADO
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

/* =========================
   CHECKS
========================= */
function initEventosChecks() {
  ["dia1", "dia2", "dia3"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", actualizarEstado);
  });
}

/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let idJugador = document.getElementById("jugadorSelect").value;
  let asistenciaId = document.getElementById("asistenciaId").value;

  if (!idJugador) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == idJugador);

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
    jugadorId: idJugador,
    dni: jugador?.dni || "",
    nombre: jugador?.nombre || "",
    semana,
    fechaSemana: fechaInput,
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado,
    detalle: document.getElementById("detalleSemana").value
  };

  try {

    if (asistenciaId) {
      data.id = asistenciaId;
      await window.actualizarAsistenciaFirebase(data);
      alert("✏️ Actualizado");
    } else {
      await window.guardarAsistenciaFirebase(data);
      alert("✅ Guardado");
    }

    cerrar();

  } catch (e) {
    console.error(e);
    alert("❌ Error guardando");
  }
}

/* =========================
   EDITAR (FIX PRO)
========================= */
function editarAsistencia(a) {

  cerrar();

  setTimeout(() => {

    document.getElementById("asistenciaId").value = a.id;
    document.getElementById("jugadorSelect").value = a.jugadorId;

    document.getElementById("semana").value = a.semana;
    document.getElementById("fechaSemana").value = a.fechaSemana;

    document.getElementById("dia1").checked = a.dia1;
    document.getElementById("dia2").checked = a.dia2;
    document.getElementById("dia3").checked = a.dia3;

    document.getElementById("detalleSemana").value = a.detalle || "";

    actualizarEstado();

    document.getElementById("tituloModalAsistencia").innerText =
      "Editar asistencia";

    // ✅ AQUÍ ESTÁ LA CORRECCIÓN
    const labelSemana = document.getElementById("semanaLabel");
    const labelFecha = document.getElementById("fechaSemanaLabel");

    if (labelSemana) {
      labelSemana.innerText = a.semana;
    }

    if (labelFecha) {
      labelFecha.innerText =
        "Guardado: " + new Date(a.fechaSemana).toLocaleDateString("es-AR");
    }

    document.getElementById("modalAsistencia").classList.add("show");

  }, 50);
}

/* =========================
   VER JUGADOR
========================= */
window.verJugador = async function(id) {

  let jugador = jugadores.find(j => j.id == id);
  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  cont.innerHTML = `
    <div class="card">
      <h3>${jugador.nombre}</h3>
      <p><b>DNI:</b> ${jugador.dni}</p>
    </div>
  `;

  if (!data.length) {
    cont.innerHTML += "<p>Sin asistencia registrada</p>";
  } else {

    cont.innerHTML += data.map(a => {
  const fecha = new Date(a.fechaSemana).toLocaleDateString("es-AR");

  return `
    <div class="card">

      <b>Semana ${a.semana} - ${fecha}</b>

      <div>${a.estado}</div>

      <button onclick="editarAsistenciaPorId('${a.id}')">
  ✏️ Editar
</button>
    </div>
  `;
}).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
};

/* =========================
   CERRAR (FIX GLOBAL)
========================= */
function cerrar() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.remove("show");
  });
}
      throw new Error("Firebase aún no inicializado");
    }

    jugadores = await window.getJugadores();

    renderJugadores();
    cargarSemanas();
    initEventosChecks();

  } catch (e) {
    console.error("ERROR REAL:", e);
    alert("Error Firebase al cargar jugadores");
  }
};

/* =========================
   RENDER
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

      <button onclick="verJugador('${j.id}')">👁 Ver</button>
    </div>
  `).join("");
}

/* =========================
   ABRIR MODAL
========================= */
function abrirModalAsistencia() {

  cerrar(); // 🔥 IMPORTANTE

  let sel = document.getElementById("jugadorSelect");

  sel.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.nombre} - ${j.dni}
    </option>
  `).join("");

  limpiarFormulario();

  document.getElementById("tituloModalAsistencia").innerText = "Registrar asistencia";
  document.getElementById("modalAsistencia").classList.add("show");

  setFechaHoy();
  actualizarEstado();
}

/* =========================
   LIMPIAR
========================= */
function limpiarFormulario() {

  document.getElementById("asistenciaId").value = "";
  document.getElementById("jugadorSelect").value = "";

  // 🔥 NUEVOS CAMPOS
  document.getElementById("jugadorNombre").value = "";
  document.getElementById("jugadorDni").value = "";

  document.getElementById("detalleSemana").value = "";

  ["dia1", "dia2", "dia3"].forEach(id => {
    document.getElementById(id).checked = false;
  });
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
   SEMANAS
========================= */
function cargarSemanas() {

  let sel = document.getElementById("semana");

  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }

  sel.addEventListener("change", () => {
    actualizarFechaSemana();
  });

  sel.value = 1;
  actualizarFechaSemana();
}

function actualizarFechaSemana() {

  let semana = document.getElementById("semana").value;

  let fecha = getFechaPorSemana(semana);

  document.getElementById("fechaSemana").value = fecha;

  document.getElementById("fechaSemanaLabel").innerText =
    "Inicio: " + new Date(fecha).toLocaleDateString("es-AR");
}
/* =========================
   FECHA SEMANA
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
   ESTADO
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

/* =========================
   CHECKS
========================= */
function initEventosChecks() {
  ["dia1", "dia2", "dia3"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", actualizarEstado);
  });
}

/* =========================
   GUARDAR
========================= */
async function guardarAsistencia() {

  let idJugador = document.getElementById("jugadorSelect").value;
  let asistenciaId = document.getElementById("asistenciaId").value;

  if (!idJugador) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == idJugador);

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
    jugadorId: idJugador,
    dni: jugador?.dni || "",
    nombre: jugador?.nombre || "",
    semana,
    fechaSemana: fechaInput,
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado,
    detalle: document.getElementById("detalleSemana").value
  };

  try {

    if (asistenciaId) {
      data.id = asistenciaId;
      await window.actualizarAsistenciaFirebase(data);
      alert("✏️ Actualizado");
    } else {
      await window.guardarAsistenciaFirebase(data);
      alert("✅ Guardado");
    }

    cerrar();

  } catch (e) {
    console.error(e);
    alert("❌ Error guardando");
  }
}

/* =========================
   EDITAR (FIX PRO)
========================= */
function editarAsistencia(a) {

  cerrar();

  setTimeout(() => {

    document.getElementById("asistenciaId").value = a.id;
    document.getElementById("jugadorSelect").value = a.jugadorId;

    document.getElementById("semana").value = a.semana;

    // 🔥 FIX IMPORTANTE: sincronizar fecha con semana
    actualizarFechaSemana();

    document.getElementById("fechaSemana").value = a.fechaSemana;

    document.getElementById("dia1").checked = a.dia1;
    document.getElementById("dia2").checked = a.dia2;
    document.getElementById("dia3").checked = a.dia3;

    document.getElementById("detalleSemana").value = a.detalle || "";

    actualizarEstado();

    document.getElementById("tituloModalAsistencia").innerText =
      "Editar asistencia";

    // 🔥 LABELS SEGUROS
    const labelSemana = document.getElementById("semanaLabel");
    const labelFecha = document.getElementById("fechaSemanaLabel");

    if (labelSemana) {
      labelSemana.innerText = a.semana;
    }

    if (labelFecha) {
      labelFecha.innerText =
        new Date(a.fechaSemana).toLocaleDateString("es-AR");
    }

    document.getElementById("modalAsistencia").classList.add("show");

  }, 50);
}

/* =========================
   VER JUGADOR
========================= */
window.verJugador = async function(id) {

  let jugador = jugadores.find(j => j.id == id);
  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  cont.innerHTML = `
    <div class="card">
      <h3>${jugador.nombre}</h3>
      <p><b>DNI:</b> ${jugador.dni}</p>
    </div>
  `;

  if (!data.length) {
    cont.innerHTML += "<p>Sin asistencia registrada</p>";
  } else {

    cont.innerHTML += data.map(a => {
  const fecha = new Date(a.fechaSemana).toLocaleDateString("es-AR");

  return `
    <div class="card">

      <b>Semana ${a.semana} - ${fecha}</b>

      <div>${a.estado}</div>

      <button onclick="editarAsistenciaPorId('${a.id}')">
        ✏️ Editar
      </button>
    </div>
  `;
}).join("");
  }

  document.getElementById("modalJugador").classList.add("show");
};
window.editarAsistenciaPorId = function(id) {

  let asistencia = window.asistencias?.find(a => a.id === id);

  if (!asistencia) {
    alert("No se encontró la asistencia");
    return;
  }

  editarAsistencia(asistencia);
};

/* =========================
   CERRAR (FIX GLOBAL)
========================= */
function cerrar() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.remove("show");
  });
}
