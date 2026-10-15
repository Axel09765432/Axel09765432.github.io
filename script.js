/* ASCSELO — script.js
   Cambia aquí tu número de WhatsApp (lada de país + número, sin + ni espacios).
   Ejemplo para México: "5215512345678" */
const CONFIG = {
  whatsapp: "52XXXXXXXXXX",
  instagram: "https://instagram.com/ascselo"
};

/* Fotos: sube estos archivos a la carpeta img/ de tu repositorio.
   Si dejas img vacío, se muestra "Foto pendiente". */
const PRODUCTS = [
  { id: "waffle-blanco", group: "waffle", name: "Conjunto Waffle Knit Blanco",
    desc: "Playera de manga corta y short waffle knit a juego. Tela pesada, diseño monocromático.",
    price: "Desde $189 MXN", img: "", pieces: ["Conjunto completo", "Solo playera", "Solo short"] },
  { id: "waffle-negro", group: "waffle", name: "Conjunto Waffle Knit Negro",
    desc: "Playera de manga corta y short waffle knit a juego en negro. Tela pesada, apariencia premium.",
    price: "Desde $189 MXN", img: "", pieces: ["Conjunto completo", "Solo playera", "Solo short"] },
  { id: "hoodie-gris", group: "hoodies", name: "Hoodie Acid Wash Gris",
    desc: "Pullover oversized efecto Acid Wash en gris claro deslavado con matices marfil. Felpa Toronto de alto gramaje.",
    price: "Desde $300 MXN", img: "" },
  { id: "hoodie-morada", group: "hoodies", name: "Hoodie Acid Wash Morada",
    desc: "Pullover oversized efecto Acid Wash / Mineral Wash en morado deslavado. Felpa Toronto de gramaje pesado.",
    price: "Desde $300 MXN", img: "" },
  { id: "hoodie-serpiente", group: "hoodies", name: "Hoodie Serpiente",
    desc: "Hoodie clásico con cordón y bolsillo canguro, negro azabache. Gráfico de serpiente estilo lujo al frente.",
    price: "Desde $300 MXN", img: "img/hoodie-serpiente.jpg" },
  { id: "hoodie-tigre", group: "hoodies", name: "Hoodie Tigre",
    desc: "Hoodie clásico con cordón y bolsillo canguro, negro azabache. Cabeza de tigre rugiendo en la espalda.",
    price: "Desde $300 MXN", img: "img/hoodie-tigre.jpg" }
];
const SIZES = ["CH", "G", "L", "XL"];

const $ = (s, r = document) => r.querySelector(s);
const waLink = (text) => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

/* ---------- 3D: letras ---------- */
function mix(a, b, t) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
(function letters() {
  const word = $("#word");
  "ASCSELO".split("").forEach((ch, k) => {
    const l = document.createElement("div");
    l.className = "l";
    l.setAttribute("aria-hidden", "true");
    l.style.animationDelay = (k * 0.25) + "s";
    for (let i = 11; i >= 0; i--) {
      const ly = document.createElement("div");
      ly.className = "ly";
      ly.textContent = ch;
      ly.style.transform = "translateZ(" + (-i * 1.6) + "px)";
      ly.style.color = i === 0 ? "#171614" : mix("#8f8672", "#2c2a25", i / 11);
      l.appendChild(ly);
    }
    word.appendChild(l);
  });
})();

/* ---------- 3D: logo ---------- */
(function logo() {
  const slab = $("#slab");
  for (let i = 9; i >= 0; i--) {
    const im = document.createElement("img");
    im.src = "img/logo-ascselo.jpg";
    im.alt = "";
    im.style.transform = "translateZ(" + (-i * 2) + "px)";
    im.style.filter = "brightness(" + (i === 0 ? 1 : 0.55) + ")";
    slab.appendChild(im);
  }
})();

/* ---------- Productos ---------- */
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
(function products() {
  PRODUCTS.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    const shot = p.img
      ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<div class="ph">Foto pendiente</div>';
    const pieces = (p.pieces || []).map((n, i) =>
      '<label><input type="radio" name="pz-' + p.id + '" value="' + esc(n) + '"' + (i === 0 ? " checked" : "") + '><span>' + esc(n) + '</span></label>').join("");
    const sizes = SIZES.map(s =>
      '<label><input type="radio" name="sz-' + p.id + '" value="' + s + '"><span>' + s + '</span></label>').join("");
    card.innerHTML =
      '<div class="shot">' + shot + '</div>' +
      '<h4>' + esc(p.name) + '</h4>' +
      '<p class="desc">' + esc(p.desc) + '</p>' +
      '<p class="price">' + esc(p.price) + '</p>' +
      (pieces ? '<div class="opts pieza" role="radiogroup" aria-label="Pieza">' + pieces + '</div>' : "") +
      '<div class="opts" role="radiogroup" aria-label="Talla">' + sizes + '</div>' +
      '<button class="add" type="button" data-id="' + p.id + '">Agregar al pedido</button>';
    $("#grid-" + p.group).appendChild(card);
  });
  document.addEventListener("click", e => {
    const b = e.target.closest(".add");
    if (!b) return;
    const p = PRODUCTS.find(x => x.id === b.dataset.id);
    const sz = document.querySelector('input[name="sz-' + p.id + '"]:checked');
    if (!sz) {
      const t = b.textContent; b.textContent = "Elige tu talla";
      setTimeout(() => { b.textContent = t; }, 1400);
      return;
    }
    const pz = document.querySelector('input[name="pz-' + p.id + '"]:checked');
    cart.push({ name: p.name, size: sz.value, piece: pz ? pz.value : "" });
    saveCart(); renderCart();
    const t = b.textContent; b.textContent = "Agregado";
    setTimeout(() => { b.textContent = t; }, 1200);
  });
})();

/* ---------- Pedido ---------- */
let cart = [];
try { cart = JSON.parse(store.get("ascselo_cart") || "[]"); } catch (e) { cart = []; }
function saveCart() { store.set("ascselo_cart", JSON.stringify(cart)); }
function renderCart() {
  const ul = $("#cart-list");
  ul.innerHTML = "";
  cart.forEach((it, i) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    left.textContent = it.name;
    const sm = document.createElement("small");
    sm.textContent = (it.piece ? it.piece + " · " : "") + "Talla " + it.size;
    left.appendChild(sm);
    const rm = document.createElement("button");
    rm.type = "button"; rm.textContent = "Quitar";
    rm.addEventListener("click", () => { cart.splice(i, 1); saveCart(); renderCart(); });
    li.appendChild(left); li.appendChild(rm);
    ul.appendChild(li);
  });
  $("#cart-count").textContent = cart.length;
  $("#cart-empty").hidden = cart.length > 0;
  $("#cart-send").hidden = cart.length === 0;
}
$("#btn-cart").addEventListener("click", () => { $("#drawer").hidden = false; });
$("#drawer-close").addEventListener("click", () => { $("#drawer").hidden = true; });
$("#cart-send").addEventListener("click", () => {
  const lines = cart.map(it => "- " + it.name + (it.piece ? " (" + it.piece + ")" : "") + " · Talla " + it.size);
  window.open(waLink("Hola ASCSELO, quiero hacer este pedido:\n" + lines.join("\n")), "_blank");
});
renderCart();

/* ---------- Menú ---------- */
const menu = $("#menu");
$("#btn-menu").addEventListener("click", () => { menu.hidden = false; });
$("#menu-close").addEventListener("click", () => { menu.hidden = true; });
menu.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a) return;
  if (a.dataset.chat) { e.preventDefault(); menu.hidden = true; openChat(a.dataset.chat); return; }
  menu.hidden = true;
});
document.querySelectorAll("[data-ig]").forEach(a => { a.href = CONFIG.instagram; a.target = "_blank"; a.rel = "noopener"; });
document.querySelectorAll("[data-wa]").forEach(a => { a.href = waLink(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });

/* ---------- Cookies ---------- */
(function cookies() {
  const bar = $("#cookies");
  if (store.get("ascselo_cookies") === "ok") return;
  bar.hidden = false;
  document.body.classList.add("has-cookies");
  $("#cookies-accept").addEventListener("click", () => {
    store.set("ascselo_cookies", "ok");
    bar.hidden = true;
    document.body.classList.remove("has-cookies");
  });
  $("#cookies-more").addEventListener("click", e => {
    e.preventDefault();
    e.target.textContent = "Usamos cookies para recordar tu pedido y entender cómo se usa el sitio.";
  });
})();

/* ---------- Chat ---------- */
const chat = $("#chat"), body = $("#chat-body");
const WA_FALLBACK = '<a href="' + "#" + '" data-wa-link>escríbenos por WhatsApp</a>';
const ANSWERS = {
  "Información de mi pedido": "Para revisar tu pedido necesitamos tu nombre y lo que compraste: {wa}",
  "Catálogo de productos": 'Tenemos conjuntos waffle knit (desde $189 MXN) y hoodies (desde $300 MXN). <a href="#productos" data-close>Ver la colección</a>.',
  "Métodos de pago": "Aceptamos transferencia SPEI y depósito a tarjeta de débito. Después manda tu comprobante por DM a @ascselo con tu nombre y pedido para confirmar.",
  "Envíos y devoluciones": "Enviamos por paquetería a todo el país. Para costo, tiempos y cambios, {wa}",
  "Tallas": "Manejamos tallas CH, G, L y XL. Los hoodies son oversized. Si dudas de tu talla, {wa}",
  "Atención al cliente": "Con gusto te ayudamos: {wa}"
};
const QUICK = ["Información de mi pedido", "Catálogo de productos", "Métodos de pago", "Envíos y devoluciones", "Tallas"];
const KEYWORDS = [
  [/pag|transfer|depos|spei|tarjeta/i, "Métodos de pago"],
  [/talla|medida|ch\b|xl/i, "Tallas"],
  [/env[ií]|paquet|entrega|devol|cambio/i, "Envíos y devoluciones"],
  [/pedido|compra|orden|guía|guia/i, "Información de mi pedido"],
  [/cat[aá]logo|hoodie|sudadera|waffle|precio|cu[aá]nto|conjunto/i, "Catálogo de productos"]
];
function addMsg(html, who) {
  const m = document.createElement("div");
  m.className = "msg " + who;
  if (who === "me") m.textContent = html; else m.innerHTML = html;
  body.appendChild(m);
  body.scrollTop = body.scrollHeight;
  m.querySelectorAll("[data-wa-link]").forEach(a => { a.href = waLink("Hola ASCSELO, necesito ayuda."); a.target = "_blank"; a.rel = "noopener"; });
  m.querySelectorAll("[data-close]").forEach(a => a.addEventListener("click", () => { chat.hidden = true; }));
}
function answer(topic) {
  addMsg(ANSWERS[topic].replace("{wa}", WA_FALLBACK + "."), "bot");
}
function greet() {
  addMsg("¡Hola! Bienvenido a ASCSELO.<br><br>Soy un asistente virtual automático y puedo cometer errores.<br><br>¿En qué te podemos ayudar hoy? Elige una opción o escríbeme lo que necesitas.", "bot");
  const q = document.createElement("div");
  q.className = "quick";
  QUICK.forEach(t => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = t;
    b.addEventListener("click", () => { addMsg(t, "me"); answer(t); });
    q.appendChild(b);
  });
  body.appendChild(q);
}
function openChat(topic) {
  chat.hidden = false;
  if (!body.children.length) greet();
  if (topic && ANSWERS[topic]) { addMsg(topic, "me"); answer(topic); }
}
$("#chat-fab").addEventListener("click", () => openChat());
$("#chat-close").addEventListener("click", () => { chat.hidden = true; });
$("#chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMsg(text, "me");
  const hit = KEYWORDS.find(k => k[0].test(text));
  if (hit) answer(hit[1]);
  else addMsg("No estoy seguro de esa pregunta. Te atendemos directo: " + WA_FALLBACK + ".", "bot");
});
