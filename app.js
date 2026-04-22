let datos = { jugadores: [] };
let jugadorActual = null;
let iniciado = false;

/* =========================
   IMG SEGURA (SIN 404)
========================= */
function getFoto(url) {
  const fallback = "https://i.pravatar.cc/200";

  if (!url || url === "" || url === "default_user.png") {
    return fallback;
  }

  try {
    return url.includes("cloudinary")
      ? url.replace("/upload/", "/upload/w_200,h_200,c_fill/")
      : url;
  } catch {
    return fallback;
  }
}

/* =========================
   INIT
========================= */
function iniciarApp() {

  if (!window.api) {
    setTimeout(iniciarApp, 100);
    return;
  }

  if (iniciado) return;
  iniciado = true;

  console.log("✅ Firebase listo");

  initEventos();
  initPreview();
  cargar();
}

/* =========================
   EVENTOS
========================= */
function initEventos() {

  document.getElementById("btnNuevo")?.addEventListener("click", abrirModal);
  document.getElementById("btnCerrar")?.addEventListener("click", cerrar);
  document.getElementById("btnGuardar")?.addEventListener("click", guardar);
  document.getElementById("btnEditar")?.addEventListener("click", editarJugador);
  document.getElementById("btnEliminar")?.addEventListener("click", eliminarJugador);
  document.getElementById("btnReload")?.addEventListener("click", cargar);
  document.getElementById("buscar")?.addEventListener("input", render);
  document.getElementById("btnCerrarVer")?.addEventListener("click", cerrar);

   document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-ver");
  if (btn) {
    const id = btn.dataset.id;
    verJugador(id);
  }
});
}

/* =========================
   CARGAR
========================= */
async function cargar() {

  showMsg("⏳ Cargando...");

  try {

    const jugadores = await window.api.getJugadores();
    datos.jugadores = Array.isArray(jugadores) ? jugadores : [];

    render();
    showMsg(`✅ ${datos.jugadores.length} jugadores cargados`);

  } catch (e) {
    console.error("🔥 ERROR FIREBASE:", e);
    showMsg("❌ Error cargando datos");
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

  cont.innerHTML = lista.map(j => {

    const puestos = [j.puesto1, j.puesto2, j.puesto3]
      .filter(p => p)
      .join(" / ");

    return `
      <div class="fila">

        <div style="display:flex;align-items:center;gap:10px">

          <img src="${getFoto(j.foto, j.id)}"
               onerror="this.src='https://i.pravatar.cc/200'"
               style="width:40px;height:40px;border-radius:50%;object-fit:cover;">

          <div>
            <b>${j.nombre || "-"}</b>
            ${j.apodo ? `<span>(${j.apodo})</span>` : ""}

            <div style="font-size:12px;opacity:.7">
              DNI: ${j.dni || "-"}
            </div>

            <div style="font-size:12px;color:#007bff;font-weight:bold">
              ${puestos || "Sin puestos"}
            </div>
          </div>

        </div>

        <button class="btn-ver" data-id="${j.id}">👁</button>

      </div>
    `;
  }).join("");
}

/* =========================
   VER
========================= */
window.verJugador = function(id) {

  const j = datos.jugadores.find(x => x.id == id);
  if (!j) return;

  jugadorActual = j;

  document.getElementById("detalle").innerHTML = `
    <img src="${getFoto(j.foto, j.id)}"
         onerror="this.src='https://i.pravatar.cc/200'"
         style="width:200px;border-radius:10px;margin-bottom:10px;">
    <p><b>Nombre:</b> ${j.nombre || "-"}</p>
    <p><b>Apodo:</b> ${j.apodo || "-"}</p>
    <p><b>DNI:</b> ${j.dni || "-"}</p>
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

  document.getElementById("tituloModal").innerText = "Nuevo Jugador";
  document.getElementById("modal").classList.add("show");
}

function cerrar() {
  document.querySelectorAll(".modal")
    .forEach(m => m.classList.remove("show"));
}

/* =========================
   PREVIEW
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
   SUBIR IMAGEN
========================= */
async function subirImagen(file) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "jugadores");

  const res = await fetch("https://api.cloudinary.com/v1_1/dzeysfmyu/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  console.log("📸 Cloudinary:", data);

  if (!res.ok) {
    throw new Error(data.error?.message || "Error subiendo imagen");
  }

  return data.secure_url;
}

/* =========================
   GUARDAR
========================= */
async function guardar() {

  try {

    const file = document.getElementById("foto").files[0];
    let fotoURL = jugadorActual?.foto || "";

    if (file) {
      showMsg("📤 Subiendo imagen...");
      fotoURL = await subirImagen(file);
    }

    const data = {
      dni: document.getElementById("dni").value.trim(),
      nombre: document.getElementById("nombre").value.trim(),
      apodo: document.getElementById("apodo").value.trim(),
      celular: document.getElementById("celular").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      puesto1: document.getElementById("p1").value,
      puesto2: document.getElementById("p2").value,
      puesto3: document.getElementById("p3").value,
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
    alert("❌ Error guardando");
  }
}

/* =========================
   EDITAR
========================= */
function editarJugador() {

  if (!jugadorActual) return alert("Seleccioná un jugador");

  cerrar();

  ["dni","nombre","apodo","celular","correo"].forEach(id => {
    document.getElementById(id).value = jugadorActual[id] || "";
  });

  ["p1","p2","p3"].forEach((id,i) => {
    document.getElementById(id).value = jugadorActual["puesto"+(i+1)] || "";
  });

  const preview = document.getElementById("previewFoto");

  if (jugadorActual.foto) {
    preview.src = jugadorActual.foto;
    preview.style.display = "block";
  }

  document.getElementById("tituloModal").innerText = "Editar Jugador";
  document.getElementById("modal").classList.add("show");
}

/* =========================
   ELIMINAR
========================= */
async function eliminarJugador() {

  if (!jugadorActual) return;

  if (!confirm("¿Eliminar jugador?")) return;

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
   START
========================= */
window.addEventListener("DOMContentLoaded", iniciarApp);
