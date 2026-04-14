let jugadores = [];

window.onload = async () => {
  while (!window.getJugadores) {
    await new Promise(r => setTimeout(r, 200));
  }

  jugadores = await window.getJugadores();
  renderJugadores();

  // BOTONES PRINCIPALES
  document.getElementById("btnNuevaAsistencia")
    ?.addEventListener("click", abrirModalNuevaAsistencia);

  document.getElementById("btnGuardarNueva")
    ?.addEventListener("click", guardarNuevaAsistencia);

  document.getElementById("btnGuardar")
    ?.addEventListener("click", guardarAsistencia);

  // EVENTOS DINÁMICOS (delegación global)
  document.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("btn-cerrar") ||
      e.target.id === "btnCancelar" ||
      e.target.dataset.close === "modal"
    ) {
      cerrar();
    }
  });

  // CHECKBOX NUEVO
  ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
    document.getElementById(id)
      ?.addEventListener("change", actualizarEstadoNuevo);
  });

  // CHECKBOX EDITAR
  ["dia1","dia2","dia3"].forEach(id => {
    document.getElementById(id)
      ?.addEventListener("change", actualizarEstado);
  });

  document.getElementById("nuevoSemana")
    ?.addEventListener("change", actualizarFechaNueva);

  document.getElementById("semana")
    ?.addEventListener("change", actualizarFechaEditar);
};

//////////////////////////////////////////////////
// UTILIDADES
//////////////////////////////////////////////////

function cerrar() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.remove("show");
  });
}

function cargarSemanas(id, selected = 1) {
  const sel = document.getElementById(id);
  if (!sel) return;

  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }

  sel.value = selected;
}

function getFechaPorSemana(semana) {
  let año = new Date().getFullYear();
  let fecha = new Date(año, 0, 1 + (semana - 1) * 7);

  let dia = fecha.getDay();
  let diff = (dia <= 1 ? 1 - dia : 8 - dia);

  fecha.setDate(fecha.getDate() + diff);

  return fecha.toISOString().split("T")[0];
}

//////////////////////////////////////////////////
// RENDER
//////////////////////////////////////////////////

function renderJugadores() {
  const cont = document.getElementById("tablaAsistencia");

  cont.innerHTML = jugadores.map(j => `
    <div class="fila">
      <div>
        <b>${j.nombre} (${j.apodo || "-"})</b>
        <div>DNI: ${j.dni}</div>
      </div>

      <button class="btn-ver" data-id="${j.id}">👁 Ver</button>
    </div>
  `).join("");

  cont.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", () => verJugador(btn.dataset.id));
  });
}

//////////////////////////////////////////////////
// NUEVA ASISTENCIA
//////////////////////////////////////////////////

function abrirModalNuevaAsistencia() {
  cerrar();

  const select = document.getElementById("nuevoJugadorSelect");

  select.innerHTML =
    `<option value="">Seleccionar jugador</option>` +
    jugadores.map(j => `
      <option value="${j.id}">
        ${j.dni} - ${j.nombre} (${j.apodo || "-"})
      </option>
    `).join("");

  cargarSemanas("nuevoSemana", 1);
  document.getElementById("nuevoFecha").value = getFechaPorSemana(1);

  ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
    document.getElementById(id).checked = false;
  });

  document.getElementById("nuevoDetalle").value = "";
  actualizarEstadoNuevo();

  document.getElementById("modalNuevaAsistencia").classList.add("show");
}

async function guardarNuevaAsistencia() {
  const idJugador = document.getElementById("nuevoJugadorSelect").value;

  const jugador = jugadores.find(j => String(j.id) === String(idJugador));

  const data = {
    jugadorId: idJugador,
    nombre: jugador?.nombre || "",
    apodo: jugador?.apodo || "",
    dni: jugador?.dni || "",
    semana: Number(document.getElementById("nuevoSemana").value),
    fechaSemana: document.getElementById("nuevoFecha").value,
    dia1: document.getElementById("nuevoDia1").checked,
    dia2: document.getElementById("nuevoDia2").checked,
    dia3: document.getElementById("nuevoDia3").checked,
    estado: document.getElementById("nuevoEstado").value,
    detalle: document.getElementById("nuevoDetalle").value
  };

  await window.agregarAsistenciaFirebase(data);

  cerrar();
  jugadores = await window.getJugadores();
  renderJugadores();
}

function actualizarFechaNueva() {
  const s = document.getElementById("nuevoSemana").value;
  document.getElementById("nuevoFecha").value = getFechaPorSemana(s);
}

function actualizarEstadoNuevo() {
  const d1 = document.getElementById("nuevoDia1").checked;
  const d2 = document.getElementById("nuevoDia2").checked;
  const d3 = document.getElementById("nuevoDia3").checked;

  document.getElementById("nuevoEstado").value =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";
}

//////////////////////////////////////////////////
// VER JUGADOR
//////////////////////////////////////////////////

async function verJugador(id) {
  const jugador = jugadores.find(j => j.id == id);
  const data = await window.getAsistenciaPorJugador(id);

  const cont = document.getElementById("detalleJugador");

  cont.innerHTML = `<h3>${jugador?.nombre || ""}</h3>`;

  cont.innerHTML += data.map(a => `
    <div class="card">
      <b>Semana ${a.semana}</b>
      <div>${a.estado}</div>
      <button class="btn-editar" data-id="${a.id}">✏️</button>
    </div>
  `).join("");

  cont.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const a = await window.getAsistenciaById(btn.dataset.id);
      cerrar();
      setTimeout(() => editarAsistencia(a), 50);
    });
  });

  document.getElementById("modalJugador").classList.add("show");
}

//////////////////////////////////////////////////
// EDITAR
//////////////////////////////////////////////////

function editarAsistencia(a) {
  const jugador = jugadores.find(j => String(j.id) === String(a.jugadorId));

  document.getElementById("asistenciaId").value = a.id;
  document.getElementById("jugadorIdHidden").value = a.jugadorId;

  document.getElementById("jugadorNombre").value =
    `${jugador?.nombre || ""} (${jugador?.apodo || "-"})`;

  document.getElementById("jugadorDni").value = jugador?.dni || "";

  cargarSemanas("semana", a.semana);
  document.getElementById("fechaSemana").value = a.fechaSemana;

  document.getElementById("dia1").checked = a.dia1;
  document.getElementById("dia2").checked = a.dia2;
  document.getElementById("dia3").checked = a.dia3;

  document.getElementById("detalleSemana").value = a.detalle || "";

  actualizarEstado();

  document.getElementById("modalAsistencia").classList.add("show");
}

async function guardarAsistencia() {
  const id = document.getElementById("asistenciaId").value;
  const idJugador = document.getElementById("jugadorIdHidden").value;
  const semana = Number(document.getElementById("semana").value);

  const jugador = jugadores.find(j => String(j.id) === String(idJugador));

  const data = {
    id,
    jugadorId: idJugador,
    nombre: jugador?.nombre || "",
    apodo: jugador?.apodo || "",
    dni: jugador?.dni || "",
    semana,
    fechaSemana: document.getElementById("fechaSemana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked,
    estado: document.getElementById("estadoSemana").value,
    detalle: document.getElementById("detalleSemana").value
  };

  await window.actualizarAsistenciaFirebase(data);

  cerrar();
  jugadores = await window.getJugadores();
  renderJugadores();
}

//////////////////////////////////////////////////
// ESTADO
//////////////////////////////////////////////////

function actualizarEstado() {
  const d1 = document.getElementById("dia1").checked;
  const d2 = document.getElementById("dia2").checked;
  const d3 = document.getElementById("dia3").checked;

  document.getElementById("estadoSemana").value =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";
}
