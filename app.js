let datos = { jugadores: [] };
let jugadorActual = null;

/* =========================
   CARGAR
========================= */
async function cargar() {

  if (!window.api) {
    console.error("API no cargada");
    return;
  }

  showMsg("⏳ Cargando...");

  try {
    datos.jugadores = await window.api.getJugadores();
    render();
    showMsg("✅ Datos cargados");
  } catch (e) {
    console.error(e);
    showMsg("❌ Error cargando");
  }
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

  if (!lista.length) {
    cont.innerHTML = "<p style='opacity:.6'>No hay jugadores</p>";
    return;
  }

  cont.innerHTML = lista.map(j => `
    <div class="fila">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${j.foto || 'https://via.placeholder.com/40'}"
             style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
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
  if (!j) return;

  jugadorActual = j;

  document.getElementById("detalle").innerHTML = `
    ${j.foto ? `<img src="${j.foto}" style="width:200px;border-radius:10px;margin-bottom:10px;">` : ""}
    <p><b>Nombre:</b> ${j.nombre}</p>
    <p><b>DNI:</b> ${j.dni}</p>
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
  preview.src = "";
  preview.style.display = "none";

  document.getElementById("modal").classList.add("show");
}

function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

/* =========================
   PREVIEW FOTO
========================= */
function initPreview() {
  document.getElementById("foto")?.addEventListener("change", e => {

    const file = e.target.files[0];
    const preview = document.getElementById("previewFoto");

    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });
}

/* =========================
   SUBIR IMAGEN (Cloudinary)
========================= */
async function subirImagen(file) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "rhnqv3op"); // 👈 TU PRESET

  const res = await fetch("https://api.cloudinary.com/v1_1/dzeysfmy/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (!data.secure_url) {
    console.error("Error Cloudinary:", data);
    throw new Error("No se pudo subir la imagen");
  }

  // 🔥 optimización automática
  return data.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill/");
}

/* =========================
   GUARDAR
========================= */
async function guardar() {

  const file = document.getElementById("foto").files[0];
  let fotoURL = jugadorActual?.foto || "";

  try {

    if (file) {
      showMsg("📤 Subiendo imagen...");
      fotoURL = await subirImagen(file);
    }

    const data = {
      dni: document.getElementById("dni").value,
      nombre: document.getElementById("nombre").value,
      foto: fotoURL
    };

    if (!data.dni || !data.nombre) {
      return alert("⚠️ Completa DNI y Nombre");
    }

    if (jugadorActual?.id) {
      data.id = jugadorActual.id;
      await window.api.updateJugador(data);
    } else {
      await window.api.addJugador(data);
    }

    cerrar();
    cargar();

  } catch (e) {
    console.error(e);
    alert("❌ Error guardando o subiendo imagen");
  }
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
   UI
========================= */
function showMsg(msg) {
  const el = document.getElementById("estado");
  if (el) el.innerText = msg;
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {

  initPreview();

  document.getElementById("btnNuevo")?.addEventListener("click", abrirModal);
  document.getElementById("btnCerrar")?.addEventListener("click", cerrar);
  document.getElementById("btnGuardar")?.addEventListener("click", guardar);
  document.getElementById("btnEditar")?.addEventListener("click", editarJugador);
  document.getElementById("btnEliminar")?.addEventListener("click", eliminarJugador);
  document.getElementById("btnReload")?.addEventListener("click", cargar);
  document.getElementById("buscar")?.addEventListener("input", render);
  document.getElementById("btnCerrarVer")?.addEventListener("click", cerrar);

  cargar();
});
