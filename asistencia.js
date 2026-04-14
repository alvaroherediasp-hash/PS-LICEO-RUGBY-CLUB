let jugadores = [];

window.onload = async () => {
  try {

    while (!window.getJugadores) {
      await new Promise(r => setTimeout(r, 200));
    }

    jugadores = await window.getJugadores();

    renderJugadores();
    cargarSemanas();
    initEventosChecks();

    // BOTONES
    document.getElementById("btnNuevaAsistencia")
      .addEventListener("click", abrirModalNuevaAsistencia);

    document.getElementById("btnGuardarNueva")
      .addEventListener("click", guardarNuevaAsistencia);

    document.getElementById("btnGuardar")
      .addEventListener("click", guardarAsistencia);

    // cerrar
    document.querySelectorAll(".btn-cerrar").forEach(btn => {
      btn.addEventListener("click", cerrar);
    });

    // checks nuevo
    ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
      document.getElementById(id)
        ?.addEventListener("change", actualizarEstadoNuevo);
    });

  } catch (e) {
    console.error(e);
    alert("Error: " + e.message);
  }
};

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
        <b>${j.apodo || j.nombre}</b>
        <div>DNI: ${j.dni}</div>
      </div>

      <button class="btn-ver" data-id="${j.id}">👁 Ver</button>
    </div>
  `).join("");

  cont.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", () => {
      verJugador(btn.dataset.id);
    });
  });
}

//////////////////////////////////////////////////
// MODAL NUEVO
//////////////////////////////////////////////////
function abrirModalNuevaAsistencia() {

  cerrar();

  const select = document.getElementById("nuevoJugadorSelect");

  select.innerHTML = `
    <option value="">Seleccionar jugador</option>
  ` + jugadores.map(j => `
    <option value="${j.id}">
      ${j.apodo || j.nombre} - DNI: ${j.dni}
    </option>
  `).join("");

  const semana = document.getElementById("nuevoSemana");
  semana.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    semana.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }

  semana.value = 1;

  let hoy = new Date();
  document.getElementById("nuevoFecha").value =
    hoy.toISOString().split("T")[0];

  ["nuevoDia1","nuevoDia2","nuevoDia3"].forEach(id => {
    document.getElementById(id).checked = false;
  });

  document.getElementById("nuevoDetalle").value = "";

  actualizarEstadoNuevo();

  document.getElementById("modalNuevaAsistencia")
    .classList.add("show");
}

function actualizarEstadoNuevo() {

  let d1 = document.getElementById("nuevoDia1").checked;
  let d2 = document.getElementById("nuevoDia2").checked;
  let d3 = document.getElementById("nuevoDia3").checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  document.getElementById("nuevoEstado").value = estado;
}

async function guardarNuevaAsistencia() {

  let idJugador = document.getElementById("nuevoJugadorSelect").value;
  if (!idJugador) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == idJugador);

  let d1 = document.getElementById("nuevoDia1").checked;
  let d2 = document.getElementById("nuevoDia2").checked;
  let d3 = document.getElementById("nuevoDia3").checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  let data = {
    jugadorId: idJugador,
    nombre: jugador.nombre,
    dni: jugador.dni,
    semana: Number(document.getElementById("nuevoSemana").value),
    fechaSemana: document.getElementById("nuevoFecha").value,
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado,
    detalle: document.getElementById("nuevoDetalle").value
  };

  try {
    await window.guardarAsistenciaFirebase(data);
    alert("✅ Guardado");
    cerrar();
  } catch (e) {
    console.error(e);
    alert("Error");
  }
}

//////////////////////////////////////////////////
// EDITAR (MODAL VIEJO)
//////////////////////////////////////////////////
function editarAsistencia(a) {

  cerrar();

  setTimeout(() => {

    // llenar select
    const select = document.getElementById("jugadorSelect");
    select.innerHTML = jugadores.map(j => `
      <option value="${j.id}">
        ${j.apodo || j.nombre} - DNI: ${j.dni}
      </option>
    `).join("");

    // jugador
    const jugador = jugadores.find(j => j.id == a.jugadorId);

    document.getElementById("asistenciaId").value = a.id;
    document.getElementById("jugadorSelect").value = a.jugadorId;

    document.getElementById("jugadorNombre").value =
      jugador?.nombre || "";

    document.getElementById("jugadorDni").value =
      jugador?.dni || "";

    // datos
    document.getElementById("semana").value = a.semana;
    document.getElementById("fechaSemana").value = a.fechaSemana;

    document.getElementById("dia1").checked = a.dia1;
    document.getElementById("dia2").checked = a.dia2;
    document.getElementById("dia3").checked = a.dia3;

    document.getElementById("detalleSemana").value = a.detalle || "";

    actualizarEstado();

    document.getElementById("tituloModalAsistencia").innerText =
      "Editar asistencia";

    document.getElementById("modalAsistencia").classList.add("show");

  }, 50);
}

async function guardarAsistencia() {

  let idJugador = document.getElementById("jugadorSelect").value;
  let asistenciaId = document.getElementById("asistenciaId").value;

  if (!idJugador) return alert("Selecciona jugador");

  let jugador = jugadores.find(j => j.id == idJugador);

  let d1 = document.getElementById("dia1").checked;
  let d2 = document.getElementById("dia2").checked;
  let d3 = document.getElementById("dia3").checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  let data = {
    id: asistenciaId,
    jugadorId: idJugador,
    nombre: jugador.nombre,
    dni: jugador.dni,
    semana: Number(document.getElementById("semana").value),
    fechaSemana: document.getElementById("fechaSemana").value,
    dia1: d1,
    dia2: d2,
    dia3: d3,
    estado,
    detalle: document.getElementById("detalleSemana").value
  };

  try {
    await window.actualizarAsistenciaFirebase(data);
    alert("✏️ Actualizado");
    cerrar();
  } catch (e) {
    console.error(e);
    alert("Error");
  }
}

//////////////////////////////////////////////////
// VER JUGADOR
//////////////////////////////////////////////////
async function verJugador(id) {

  let jugador = jugadores.find(j => j.id == id);
  let data = await window.getAsistenciaPorJugador(id);

  let cont = document.getElementById("detalleJugador");

  cont.innerHTML = `
    <div class="card">
      <h3>${jugador.apodo || jugador.nombre}</h3>
      <p>DNI: ${jugador.dni}</p>
    </div>
  `;

  cont.innerHTML += data.map(a => `
    <div class="card">
      <b>Semana ${a.semana}</b>
      <div>${a.estado}</div>

      <button class="btn-editar" data-id="${a.id}">✏️</button>
      <button class="btn-eliminar" data-id="${a.id}">🗑️</button>
    </div>
  `).join("");

  // eventos
  cont.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const asistencia = await window.getAsistenciaById(btn.dataset.id);
      editarAsistencia(asistencia);
    });
  });

  cont.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      eliminarAsistencia(btn.dataset.id);
    });
  });

  document.getElementById("modalJugador").classList.add("show");
}

//////////////////////////////////////////////////
// ELIMINAR
//////////////////////////////////////////////////
async function eliminarAsistencia(id) {

  if (!confirm("Eliminar?")) return;

  await window.eliminarAsistenciaFirebase(id);
  alert("Eliminado");
  cerrar();
}

//////////////////////////////////////////////////
// OTROS
//////////////////////////////////////////////////
function cargarSemanas() {
  let sel = document.getElementById("semana");
  if (!sel) return;

  sel.innerHTML = "";

  for (let i = 1; i <= 52; i++) {
    sel.innerHTML += `<option value="${i}">Semana ${i}</option>`;
  }
}

function initEventosChecks() {
  ["dia1","dia2","dia3"].forEach(id => {
    document.getElementById(id)
      ?.addEventListener("change", actualizarEstado);
  });
}

function actualizarEstado() {
  let d1 = document.getElementById("dia1")?.checked;
  let d2 = document.getElementById("dia2")?.checked;
  let d3 = document.getElementById("dia3")?.checked;

  let estado =
    (d1 && d2 && d3) ? "🟢 COMPLETO" :
    (d1 || d2 || d3) ? "🟡 INCOMPLETO" :
    "🔴 NO ASISTIÓ";

  if (document.getElementById("estadoSemana"))
    document.getElementById("estadoSemana").value = estado;
}

function cerrar() {
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.remove("show");
  });
}
