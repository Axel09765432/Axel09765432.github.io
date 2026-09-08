/* =========================================================
   ASCSELO — script.js
   Requiere: index.html con <script type="importmap"> apuntando
   a three.module.min.js y a three/addons/ (ya incluido).
   ========================================================= */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =========================================================
   1) INTRO — letras 3D formando ASCSELO
   ========================================================= */

// Orden de archivos = orden de la palabra (A S C S E L O)
// Ajusta estos valores en radianes si alguna letra no queda de frente.
const LETTER_FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const LETTER_ROTATION_Y = {
  A: Math.PI,        // estaba mirando hacia atrás -> girar 180°
  B: 0,
  C: -Math.PI / 2,    // orientar hacia la izquierda
  D: 0,
  E: -Math.PI / 2,    // orientar hacia la izquierda
  F: Math.PI / 2,     // L: mirando de frente -> girar hacia la derecha
  G: 0
};

const INTRO_HOLD_MS = 10000; // 10s completamente quietas

function initIntro() {
  const canvas = document.getElementById('intro-canvas');
  const introEl = document.getElementById('intro');
  const skipBtn = document.getElementById('intro-skip');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 8, 22);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.3, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Iluminación oscura y elegante: luz fría de relleno + rim cálido tenue
  const ambient = new THREE.AmbientLight(0x3a362f, 1.1);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xe7ddc7, 1.6);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6e1c1c, 0.8);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const loader = new GLTFLoader();
  const spacing = 1.5;
  let loadedCount = 0;
  let introEnded = false;

  LETTER_FILES.forEach((file, i) => {
    loader.load(
      `img-3d/${file}.glb`,
      (gltf) => {
        const model = gltf.scene;

        // Escala uniforme: todas las letras a la misma altura visual, sin deformar
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 1.3;
        const scale = targetSize / maxDim;
        model.scale.setScalar(scale);

        // Recentrar el modelo en su propio origen
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center.multiplyScalar(scale));

        model.rotation.y += LETTER_ROTATION_Y[file] || 0;
        model.position.x += (i - (LETTER_FILES.length - 1) / 2) * spacing;

        group.add(model);
        loadedCount++;
        if (loadedCount === LETTER_FILES.length) startHold();
      },
      undefined,
      (err) => {
        console.error(`No se pudo cargar img-3d/${file}.glb`, err);
        loadedCount++;
        if (loadedCount === LETTER_FILES.length) startHold();
      }
    );
  });

  function startHold() {
    // Las letras ya están todas colocadas y quietas: esperar 10s exactos.
    setTimeout(endIntro, INTRO_HOLD_MS);
  }

  function endIntro() {
    if (introEnded) return;
    introEnded = true;
    introEl.classList.add('intro-done');
    revealPage();
    initLogoScene();
    setTimeout(() => { introEl.style.display = 'none'; }, 1200);
  }

  skipBtn?.addEventListener('click', endIntro);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  function animate() {
    if (introEl.style.display === 'none') return;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

function revealPage() {
  document.querySelectorAll('.hidden-until-intro').forEach((el, i) => {
    setTimeout(() => el.classList.add('reveal'), i * 120);
  });
}

/* Logo 3D persistente en el header: mismas letras, giro continuo,
   se activa una sola vez al terminar (o saltar) la intro. */
let logoSceneStarted = false;
function initLogoScene() {
  if (logoSceneStarted) return;
  logoSceneStarted = true;

  const canvas = document.getElementById('logo-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambient = new THREE.AmbientLight(0x3a362f, 1.2);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xe7ddc7, 1.7);
  key.position.set(3, 4, 5);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = false;

  const loader = new GLTFLoader();
  const spacing = 0.95;
  const letterSpin = []; // cada letra gira por su cuenta, a su propio ritmo

  LETTER_FILES.forEach((file, i) => {
    loader.load(`img-3d/${file}.glb`, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 0.85 / maxDim;
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center.multiplyScalar(scale));

      model.rotation.y += LETTER_ROTATION_Y[file] || 0;
      model.position.x += (i - (LETTER_FILES.length - 1) / 2) * spacing;
      group.add(model);

      letterSpin.push({
        model,
        speed: 0.006 + (i % 4) * 0.003,
        dir: i % 2 === 0 ? 1 : -1
      });
    });
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function animate() {
    requestAnimationFrame(animate);
    letterSpin.forEach(l => { l.model.rotation.y += l.speed * l.dir; });
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/* =========================================================
   2) SHOWCASE — prendas en 3D (I.glb / J.glb)
   ========================================================= */

function initShowcaseModel(canvasId, glbFile) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.2, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambient = new THREE.AmbientLight(0x403c34, 1.4);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xe7ddc7, 1.8);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x5a5346, 0.6);
  fill.position.set(-4, -1, -3);
  scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.4;

  const loader = new GLTFLoader();
  loader.load(`img-3d/${glbFile}.glb`, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.4 / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    scene.add(model);
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  resize();
  animate();
}

/* =========================================================
   3) CATÁLOGO DE PRODUCTOS
   ========================================================= */

const PRODUCTS = [
  {
    id: 'conjunto-waffle-blanco',
    name: 'Conjunto Waffle Knit Blanco',
    category: 'conjuntos',
    desc: 'Playera de manga corta y short waffle knit a juego. Tela pesada, diseño monocromático.',
    img: 'img/img.02png.jpg',
    imgHover: 'img/img.1png.jpeg',
    gallery: ['img/img.02png.jpg', 'img/img.1png.jpeg', 'img/img.2png.jpeg'],
    variantImages: {
      'Conjunto completo': 'img/img.02png.jpg',
      'Solo playera': 'img/img.1png.jpeg',
      'Solo short': 'img/img.2png.jpeg'
    },
    sizes: ['CH', 'G', 'L', 'XL'],
    variants: [
      { name: 'Conjunto completo', price: 389 },
      { name: 'Solo playera', price: 200 },
      { name: 'Solo short', price: 189 }
    ]
  },
  {
    id: 'conjunto-waffle-negro',
    name: 'Conjunto Waffle Knit Negro',
    category: 'conjuntos',
    desc: 'Playera de manga corta y short waffle knit a juego en negro. Tela pesada, apariencia premium.',
    img: 'img/img.06png.jpg',
    imgHover: 'img/img.4png.png',
    gallery: ['img/img.06png.jpg', 'img/img.4png.png', 'img/img.5png.jpeg'],
    variantImages: {
      'Conjunto completo': 'img/img.06png.jpg',
      'Solo playera': 'img/img.4png.png',
      'Solo short': 'img/img.5png.jpeg'
    },
    sizes: ['CH', 'G', 'L', 'XL'],
    variants: [
      { name: 'Conjunto completo', price: 389 },
      { name: 'Solo playera', price: 200 },
      { name: 'Solo short', price: 189 }
    ]
  },
  {
    id: 'hoodie-acid-gris',
    name: 'Hoodie Acid Wash Gris',
    category: 'sudaderas',
    desc: 'Pullover oversized efecto Acid Wash en gris claro deslavado con matices marfil. Felpa Toronto de alto gramaje.',
    img: 'img/img.7png.jpg',
    imgHover: 'img/img.8png.jpg',
    gallery: ['img/img.7png.jpg', 'img/img.8png.jpg', 'img/img.9png.jpg'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'hoodie-acid-morada',
    name: 'Hoodie Acid Wash Morada',
    category: 'sudaderas',
    desc: 'Pullover oversized efecto Acid Wash / Mineral Wash en morado deslavado. Felpa Toronto de gramaje pesado.',
    img: 'img/img.10png.jpg',
    imgHover: 'img/img.11png.png',
    gallery: ['img/img.10png.jpg', 'img/img.11png.png', 'img/img.12png.JPG'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'hoodie-azul-negro',
    name: 'Hoodie Crystal Wash Azul/Negro',
    category: 'sudaderas',
    desc: 'Pullover oversized efecto Crystal Wash en azul eléctrico con negro. Exterior jaspeado, interior afelpado.',
    img: 'img/img.13png.png',
    imgHover: 'img/img.14png.jpg',
    gallery: ['img/img.13png.png', 'img/img.14png.jpg', 'img/img.15png.JPG'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'hoodie-azul-rey',
    name: 'Hoodie Spider Wash Azul Rey',
    category: 'sudaderas',
    desc: 'Pullover oversized efecto Spider Wash / Crystal Wash en azul rey marmoleado. Felpa Toronto de peso pesado.',
    img: 'img/img.16png.JPG',
    imgHover: 'img/img.17png.JPG',
    gallery: ['img/img.16png.JPG', 'img/img.17png.JPG', 'img/img.18png.JPG'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'hoodie-serpiente',
    name: 'Hoodie Serpiente',
    category: 'sudaderas',
    desc: 'Hoodie clásico con cordón y bolsillo canguro, negro azabache. Gráfico de serpiente estilo lujo al frente.',
    img: 'img/img.19png.JPG',
    imgHover: 'img/img.20png.PNG',
    gallery: ['img/img.19png.JPG', 'img/img.20png.PNG', 'img/img.21png.PNG'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'hoodie-tigre',
    name: 'Hoodie Tigre',
    category: 'sudaderas',
    desc: 'Hoodie clásico con cordón y bolsillo canguro, negro azabache. Cabeza de tigre rugiendo en la espalda.',
    img: 'img/img.22png.jpeg',
    imgHover: 'img/img.23png.jpeg',
    gallery: ['img/img.22png.jpeg', 'img/img.23png.jpeg', 'img/img.24png.jpeg'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 300
  },
  {
    id: 'pantalon-pana-negro',
    name: 'Pantalón de Pana Negro',
    category: 'pantalones',
    desc: 'Corte recto estilo Carpenter/Workwear, bolsillos de parche. Negro azabache, textura de pana.',
    img: 'img/img.38png.jpeg',
    imgHover: 'img/img.35png.jpg',
    gallery: ['img/img.38png.jpeg', 'img/img.35png.jpg', 'img/img.36png.jpg', 'img/img.37png.jpg'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 320
  },
  {
    id: 'pantalon-pana-blanco',
    name: 'Pantalón de Pana Blanco Hueso',
    category: 'pantalones',
    desc: 'Corte recto estilo Carpenter/Workwear, bolsillo de parche delantero. Blanco hueso, textura de pana.',
    img: 'img/img.39png.png',
    imgHover: 'img/img.40png.jpg',
    gallery: ['img/img.39png.png', 'img/img.40png.jpg', 'img/img.41png.jpg', 'img/img.42png.jpg'],
    sizes: ['CH', 'G', 'L', 'XL'],
    price: 320
  }
];

function formatMXN(n) {
  return `$${n.toLocaleString('es-MX')} MXN`;
}

function priceOf(product) {
  return product.price ?? Math.min(...product.variants.map(v => v.price));
}

/* =========================================================
   4) RENDER DEL CATÁLOGO
   ========================================================= */

const grid = document.getElementById('product-grid');
let activeCategory = 'todos';

function renderGrid() {
  grid.innerHTML = '';
  const items = activeCategory === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  items.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <img src="${p.imgHover}" alt="" class="img-hover" loading="lazy">
      </div>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <span class="product-price">Desde ${formatMXN(priceOf(p))}</span>
    `;
    card.addEventListener('click', () => openModal(p.id));
    grid.appendChild(card);
  });
}

document.getElementById('category-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.cat;
  renderGrid();
});

/* =========================================================
   5) MODAL DE PRODUCTO
   ========================================================= */

const productModal = document.getElementById('product-modal');
const productOverlay = document.getElementById('product-overlay');
const modalBody = document.getElementById('modal-body');
let currentProduct = null;
let currentVariant = null;
let currentSize = null;

function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  currentVariant = p.variants ? p.variants[0] : null;
  currentSize = null;

  const variantHTML = p.variants
    ? `<p class="section-label">Elige la pieza</p>
       <div class="size-row" id="variant-row">
        ${p.variants.map((v, i) => `<button class="size-btn${i === 0 ? ' selected' : ''}" data-variant="${i}">${v.name}</button>`).join('')}
       </div>`
    : '';

  const thumbsHTML = p.gallery.length > 1
    ? `<div class="modal-thumbs" id="modal-thumbs">
        ${p.gallery.map((src, i) => `<button class="modal-thumb${i === 0 ? ' active' : ''}" data-src="${src}"><img src="${src}" alt=""></button>`).join('')}
       </div>`
    : '';

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <img id="modal-main-img" src="${p.gallery[0]}" alt="${p.name}">
      ${thumbsHTML}
    </div>
    <div class="modal-info">
      <h3>${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <span class="product-price" id="modal-price">${formatMXN(priceOf(p))}</span>
      ${variantHTML}
      <p class="section-label">Talla</p>
      <div class="size-row" id="size-row">
        ${p.sizes.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join('')}
      </div>
      <button class="btn-solid" id="modal-add">Agregar al carrito</button>
    </div>
  `;

  modalBody.querySelector('#modal-thumbs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.modal-thumb');
    if (!btn) return;
    modalBody.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    modalBody.querySelector('#modal-main-img').src = btn.dataset.src;
  });

  modalBody.querySelector('#variant-row')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    modalBody.querySelectorAll('#variant-row .size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentVariant = p.variants[Number(btn.dataset.variant)];
    modalBody.querySelector('#modal-price').textContent = formatMXN(currentVariant.price);

    // Cambia la imagen principal a la pieza elegida (playera / short / conjunto)
    const variantSrc = p.variantImages?.[currentVariant.name];
    if (variantSrc) {
      modalBody.querySelector('#modal-main-img').src = variantSrc;
      modalBody.querySelectorAll('.modal-thumb').forEach(t => {
        t.classList.toggle('active', t.dataset.src === variantSrc);
      });
    }
  });

  modalBody.querySelector('#size-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    modalBody.querySelectorAll('#size-row .size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentSize = btn.dataset.size;
  });

  modalBody.querySelector('#modal-add').addEventListener('click', () => {
    if (!currentSize) {
      alert('Selecciona una talla antes de agregar al carrito.');
      return;
    }
    addToCart(p, currentVariant, currentSize);
    closeModal();
    openCart();
  });

  productModal.classList.add('open');
  productOverlay.classList.add('open');
}

function closeModal() {
  productModal.classList.remove('open');
  productOverlay.classList.remove('open');
}

document.getElementById('product-modal-close').addEventListener('click', closeModal);
productOverlay.addEventListener('click', closeModal);

/* =========================================================
   6) CARRITO
   ========================================================= */

const CART_KEY = 'ascselo_cart';
let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product, variant, size) {
  const label = variant ? variant.name : 'Único';
  const price = variant ? variant.price : product.price;
  const lineId = `${product.id}__${label}__${size}`;
  const existing = cart.find(i => i.lineId === lineId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      lineId,
      productId: product.id,
      name: product.name,
      variant: label,
      size,
      price,
      img: product.img,
      qty: 1
    });
  }
  saveCart();
  renderCart();
}

function updateQty(lineId, delta) {
  const item = cart.find(i => i.lineId === lineId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.lineId !== lineId);
  saveCart();
  renderCart();
}

function removeItem(lineId) {
  cart = cart.filter(i => i.lineId !== lineId);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const countEl = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  countEl.textContent = cart.reduce((n, i) => n + i.qty, 0);

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.img}" alt="${i.name}">
        <div>
          <p class="cart-item-name">${i.name}</p>
          <p class="cart-item-meta">${i.variant} · Talla ${i.size}</p>
          <div class="qty-control">
            <button data-action="dec" data-line="${i.lineId}">−</button>
            <span>${i.qty}</span>
            <button data-action="inc" data-line="${i.lineId}">+</button>
          </div>
          <p class="cart-item-remove" data-action="remove" data-line="${i.lineId}">Eliminar</p>
        </div>
        <span class="cart-item-price">${formatMXN(i.price * i.qty)}</span>
      </div>
    `).join('');
  }

  const total = cartTotal();
  subtotalEl.textContent = formatMXN(total);
  totalEl.textContent = formatMXN(total);
}

document.getElementById('cart-items').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, line } = btn.dataset;
  if (action === 'inc') updateQty(line, 1);
  if (action === 'dec') updateQty(line, -1);
  if (action === 'remove') removeItem(line);
});

const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.getElementById('cart-checkout').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }
  const lines = cart.map(i => `• ${i.name} (${i.variant}, talla ${i.size}) x${i.qty} — ${formatMXN(i.price * i.qty)}`);
  const message = [
    'Hola, quiero hacer un pedido en ASCSELO:',
    ...lines,
    `Total: ${formatMXN(cartTotal())}`
  ].join('\n');
  const url = `https://wa.me/message/DJHUQTS3TYOYK1?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});

/* =========================================================
   7) NAV MÓVIL
   ========================================================= */

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle?.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));

/* =========================================================
   INIT
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();
renderGrid();
renderCart();
initIntro();
initShowcaseModel('showcase-canvas-1', 'I');
initShowcaseModel('showcase-canvas-2', 'J');
