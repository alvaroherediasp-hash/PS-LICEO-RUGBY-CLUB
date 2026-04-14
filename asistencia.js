let jugadores = [];

window.onload = async () => {
  try {

    while (!window.getJugadores) {
      await new Promise(r => setTimeout(r, 200));
    }

    jugadores = await window.getJugadores();

    renderJugadores();

    // BOTONES
    document.getElementById("btnNuevaAsistencia")
      ?.addEventListener("click", abrirModalNuevaAsistencia);

    document.getElementById("btnGuardarNueva")
      ?.addEventListener("click", guardarNuevaAsistencia);

    document.getElementById("btnGuardar")
      ?.addEventListener("click", guardarAsistencia);

    // CERRAR
    document.querySelectorAll(".btn-cerrar").forEach(btn => {
      btn.addEventListener("click", cerrar);
    });

    // CHECKS
    ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
      document.getElementById(id)?.addEventListener("change", actualizarEstadoNuevo);
    });

    ["dia1","dia2","dia3"].forEach(id => {
      document.getElementById(id)?.addEventListener("change", actualizarEstado);
    });

    // FECHAS AUTOMÁTICAS
    document.getElementById("nuevoSemana")
      ?.addEventListener("change", actualizarFechaNueva);

    document.getElementById("semana")
      ?.addEventListener("change", actualizarFechaEditar);

  } catch (e) {
    console.error(e);
    alert("Error: " + e.message);
  }
};

//////////////////////////////////////////////////
// UTILIDADES
//////////////////////////////////////////////////

function cerrar() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.remove("show");
  });
}

function cargarSemanas(selectId, selected = 1) {
  const sel = document.getElementById(selectId);
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
// FECHAS (FIX CRÍTICO QUE TE FALTABA)
//////////////////////////////////////////////////

function actualizarFechaNueva() {
  let semana = document.getElementById("nuevoSemana").value;
  document.getElementById("nuevoFecha").value = getFechaPorSemana(semana);
}

function actualizarFechaEditar() {
  let semana = document.getElementById("semana").value;
  document.getElementById("fechaSemana").value = getFechaPorSemana(semana);
}

//////////////////////////////////////////////////
// RENDER
//////////////////////////////////////////////////

function renderJugadores() {

  let cont = document.getElementById("tablaAsistencia");

  if (!jugadores.length) {
    cont.innerHTML = "<p>No hay jugadores</p>";
    return;
  }

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
// DUPLICADOS
//////////////////////////////////////////////////

async function existeAsistencia(jugadorId, semana, excludeId = null) {
  const data = await window.getAsistenciaPorJugador(jugadorId);

  return data.some(a =>
    a.semana == semana && a.id != excludeId
  );
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
  actualizarFechaNueva();

  ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
    document.getElementById(id).checked = false;
  });

  document.getElementById("nuevoDetalle").value = "";

  actualizarEstadoNuevo();

  document.getElementById("modalNuevaAsistencia").classList.add("show");
}

function actualizarEstadoNuevo() {

  let d1 = document.getElementById("nuevoDia1").checked;
  let d2 = document.getElementById("nuevoDia2").checked;
  let d3 = document.getElementById("nuevoDia3").checked;

  document.getElementById("nuevoEstado").value =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";
}

async function guardarNuevaAsistencia() {

  let idJugador = document.getElementById("nuevoJugadorSelect").value;
  if (!idJugador) return alert("Selecciona jugador");

  let semana = Number(document.getElementById("nuevoSemana").value);

  if (await existeAsistencia(idJugador, semana)) {
    return alert("❌ Ya existe esa semana");
  }

  let jugador = jugadores.find(j => j.id == idJugador);

  let data = {
    jugadorId: idJugador,
    nombre: jugador.nombre,
    apodo: jugador.apodo || "",
    dni: jugador.dni,
    semana,
    fechaSemana: document.getElementById("nuevoFecha").value,
    dia1: document.getElementById("nuevoDia1").checked,
    dia2: document.getElementById("nuevoDia2").checked,
    dia3: document.getElementById("nuevoDia3").checked,
    estado: document.getElementById("nuevoEstado").value,
    detalle: document.getElementById("nuevoDetalle").value
  };

  await window.guardarAsistenciaFirebase(data);

  alert("✅ Guardado");
  cerrar();

  jugadores = await window.getJugadores();
  renderJugadores();
}

//////////////////////////////////////////////////
// VER JUGADOR (CORREGIDO)
//////////////////////////////////////////////////

async function verJugador(id) {

  const jugador = jugadores.find(j => j.id == id);
  const data = await window.getAsistenciaPorJugador(id);

  const cont = document.getElementById("detalleJugador");

  cont.innerHTML = `
    <div class="card">
      <h3>${jugador.nombre} (${jugador.apodo || "-"})</h3>
      <p>DNI: ${jugador.dni}</p>
    </div>
  `;

  if (!data.length) {
    cont.innerHTML += "<p>Sin asistencias</p>";
  } else {

    cont.innerHTML += data.map(a => {
      const fecha = new Date(a.fechaSemana).toLocaleDateString("es-AR");

      return `
        <div class="card">
          <b>Semana ${a.semana} - ${fecha}</b>
          <div>${a.estado}</div>

          <button class="btn-editar" data-id="${a.id}">✏️</button>
          <button class="btn-eliminar" data-id="${a.id}">🗑️</button>
        </div>
      `;
    }).join("");

    cont.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", async () => {
        const a = await window.getAsistenciaById(btn.dataset.id);
        cerrar();
        editarAsistencia(a);
      });
    });

    cont.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => {
        eliminarAsistencia(btn.dataset.id);
      });
    });
  }

  document.getElementById("modalJugador").classList.add("show");
}

//////////////////////////////////////////////////
// EDITAR
//////////////////////////////////////////////////

function editarAsistencia(a) {

  const jugador = jugadores.find(j => j.id == a.jugadorId);

  document.getElementById("jugadorIdHidden").value = a.jugadorId;
  document.getElementById("asistenciaId").value = a.id;

  document.getElementById("jugadorNombre").value =
    `${jugador?.nombre || ""} (${jugador?.apodo || "-"})`;

  document.getElementById("jugadorDni").value =
    jugador?.dni || "";

  cargarSemanas("semana", a.semana);
  actualizarFechaEditar();

  document.getElementById("dia1").checked = a.dia1;
  document.getElementById("dia2").checked = a.dia2;
  document.getElementById("dia3").checked = a.dia3;

  document.getElementById("detalleSemana").value = a.detalle || "";

  actualizarEstado();

  document.getElementById("modalAsistencia").classList.add("show");
}

//////////////////////////////////////////////////
// GUARDAR EDITADO
//////////////////////////////////////////////////

async function guardarAsistencia() {

  let id = document.getElementById("asistenciaId").value;
  let idJugador = document.getElementById("jugadorIdHidden").value;
  let semana = Number(document.getElementById("semana").value);

  if (await existeAsistencia(idJugador, semana, id)) {
    return alert("❌ Ya existe esa semana");
  }

  let jugador = jugadores.find(j => j.id == idJugador);

  let data = {
    id,
    jugadorId: idJugador,
    nombre: jugador.nombre,
    apodo: jugador.apodo || "",
    dni: jugador.dni,
    semana,
    fechaSemana: document.getElementById("fechaSemana").value,
    dia1: document.getElementById("dia1").checked,
    dia2: document.getElementById("dia2").checked,
    dia3: document.getElementById("dia3").checked,
    estado: document.getElementById("estadoSemana").value,
    detalle: document.getElementById("detalleSemana").value
  };

  await window.actualizarAsistenciaFirebase(data);

  alert("✏️ Actualizado");
  cerrar();

  jugadores = await window.getJugadores();
  renderJugadores();
}

//////////////////////////////////////////////////
// ELIMINAR
//////////////////////////////////////////////////

async function eliminarAsistencia(id) {
  if (!confirm("Eliminar?")) return;

  await window.eliminarAsistenciaFirebase(id);

  alert("🗑️ Eliminado");

  cerrar();

  jugadores = await window.getJugadores();
  renderJugadores();
}

//////////////////////////////////////////////////
// ESTADO EDITAR
//////////////////////////////////////////////////

function actualizarEstado() {

  let d1 = document.getElementById("dia1")?.checked;
  let d2 = document.getElementById("dia2")?.checked;
  let d3 = document.getElementById("dia3")?.checked;

  document.getElementById("estadoSemana").value =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";
}
