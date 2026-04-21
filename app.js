let datos = { jugadores: [] };
let jugadorActual = null;

/* =========================
   CARGAR
========================= */
async function cargar() {
  showMsg("⏳ Cargando...");
  datos.jugadores = await window.api.getJugadores();
  render();
}

/* =========================
   RENDER
========================= */
function render() {

  const cont = document.getElementById("tabla");
  const filtro = document.getElementById("buscar").value.toLowerCase();

  const lista = datos.jugadores.filter(j =>
    (j.nombre || "").toLowerCase().includes(filtro) ||
    (j.dni || "").includes(filtro)
  );

  cont.innerHTML = lista.map(j => `
    <div class="fila">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${j.foto || ''}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <div>
          <b>${j.nombre}</b>
          <div style="font-size:12px">DNI: ${j.dni}</div>
        </div>
      </div>

      <button onclick="verJugador('${j.id}')">👁</button>
    </div>
  `).join("");
}

/* =========================
   VER
========================= */
window.verJugador = function(id) {

  const j = datos.jugadores.find(x => x.id == id);
  jugadorActual = j;

  document.getElementById("detalle").innerHTML = `
    ${j.foto ? `<img src="${j.foto}" style="width:200px;border-radius:10px;">` : ""}
    <p>${j.nombre}</p>
    <p>${j.dni}</p>
  `;

  document.getElementById("modalVer").classList.add("show");
};

/* =========================
   MODAL
========================= */
function abrirModal() {

  jugadorActual = null;

  document.querySelectorAll("#modal input").forEach(i => i.value = "");

  const preview = document.getElementById("previewFoto");
  preview.style.display = "none";

  document.getElementById("modal").classList.add("show");
}

function cerrar() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("show"));
}

/* =========================
   PREVIEW FOTO
========================= */
document.getElementById("foto").addEventListener("change", e => {
  const file = e.target.files[0];
  const preview = document.getElementById("previewFoto");

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});

/* =========================
   SUBIR IMAGEN
========================= */
async function subirImagen(file) {

  const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js");

  const storageRef = ref(window.firebaseStorage, "jugadores/" + Date.now() + "_" + file.name);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/* =========================
   GUARDAR
========================= */
async function guardar() {

  const file = document.getElementById("foto").files[0];
  let fotoURL = jugadorActual?.foto || "";

  if (file) {
    fotoURL = await subirImagen(file);
  }

  const data = {
    dni: document.getElementById("dni").value,
    nombre: document.getElementById("nombre").value,
    foto: fotoURL
  };

  if (jugadorActual?.id) {
    data.id = jugadorActual.id;
    await window.api.updateJugador(data);
  } else {
    await window.api.addJugador(data);
  }

  cerrar();
  cargar();
}

/* =========================
   EDITAR
========================= */
function editarJugador() {

  cerrar();

  document.getElementById("dni").value = jugadorActual.dni;
  document.getElementById("nombre").value = jugadorActual.nombre;

  const preview = document.getElementById("previewFoto");

  if (jugadorActual.foto) {
    preview.src = jugadorActual.foto;
    preview.style.display = "block";
  }

  document.getElementById("modal").classList.add("show");
}

/* =========================
   ELIMINAR
========================= */
async function eliminarJugador() {
  await window.api.deleteJugador(jugadorActual.id);
  cerrar();
  cargar();
}

/* =========================
   INIT
========================= */
document.getElementById("btnNuevo").onclick = abrirModal;
document.getElementById("btnCerrar").onclick = cerrar;
document.getElementById("btnGuardar").onclick = guardar;
document.getElementById("btnEditar").onclick = editarJugador;
document.getElementById("btnEliminar").onclick = eliminarJugador;
document.getElementById("btnReload").onclick = cargar;
document.getElementById("buscar").oninput = render;
document.getElementById("btnCerrarVer").onclick = cerrar;

window.onload = cargar;
