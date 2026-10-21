import { PRODUCTS, ANGLES, imagePath, money, variantOf, subtotal, addItem, readCart } from './catalog.js';
import { setupCampaignJourney, renderSoleImpact, soleComparisonMarkup, bindSoleComparison } from './experience.js';
const $ = selector => document.querySelector(selector);
const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
const productId = document.body.dataset.product;
const product = PRODUCTS[productId];
let selectedVariant = product ? Object.keys(product.variants)[0] : null;
let selectedSize = null;
if (product) {
  const params = new URLSearchParams(location.search);
  const requestedVariant = params.get('variant') || params.get('sole');
  if (product.variants[requestedVariant]) selectedVariant = requestedVariant;
  const requestedSize = Number(params.get('size'));
  if (Number.isInteger(requestedSize) && requestedSize >= 39 && requestedSize <= 46) selectedSize = requestedSize;
}
let angle = 0;
let toastTimer;
let storage;
try { storage = localStorage; } catch { storage = null; }
let cart = readCart(storage || { getItem: () => null });

function notice(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function saveCart() {
  try { if (!storage) throw Error(); storage.setItem('low-key-store-v2', JSON.stringify(cart)); }
  catch { notice('Your browser cannot save this bag. It will last for this visit.'); }
}
function closeDialog(dialog) { dialog.close(); }
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
function renderShell() {
  $('#site-header').innerHTML = `<a class="brand" href="index.html" aria-label="LOW-KEY home"><img src="assets/v2/logo.svg" width="49" height="34" alt=""><span>LOW-KEY<sup>®</sup></span></a><nav aria-label="Main navigation"><a href="index.html#collection">The collection</a><a href="lk-007.html" ${productId==='pace'?'aria-current="page"':''}>LK-007</a><a href="lk-009.html" ${productId==='court'?'aria-current="page"':''}>LK-009</a></nav><button id="open-bag" class="bag-link" aria-haspopup="dialog" aria-label="Open shopping bag, 0 items" title="Shopping bag"><svg class="shopping-bag-icon" viewBox="0 0 24 28" aria-hidden="true" focusable="false"><path d="M4 8h16l1.5 17h-19L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg><span id="bag-count" aria-hidden="true">0</span></button>`;
  $('#site-footer').innerHTML = `<div class="footer-top"><a href="index.html" class="brand" aria-label="LOW-KEY home"><img src="assets/v2/logo.svg" alt="" width="49" height="34"><span>LOW-KEY</span></a><p>LOW-KEY NAME.<br>HIGH-KEY IMPACT.</p></div><div class="footer-links"><a href="lk-007.html">Shop LK-007 ↗</a><a href="lk-009.html">Shop LK-009 ↗</a><button data-info="delivery">Delivery & returns</button></div><div class="footer-bottom"><span>© 2026 LOW-KEY</span><span>ORIGINAL FOOTWEAR / FICTIONAL CONCEPT STORE</span></div>`;
  $('#overlays').innerHTML = `<dialog id="bag-dialog" class="bag-dialog" aria-labelledby="bag-title"><div class="dialog-heading"><div><span class="eyebrow">YOUR EVERYDAY ORIGINALS</span><h2 id="bag-title">YOUR BAG <span id="bag-number"></span></h2></div><button class="icon-button" data-close aria-label="Close bag">×</button></div><div id="bag-items"></div><div class="bag-bottom"><div class="subtotal"><span>Subtotal</span><strong id="bag-subtotal"></strong></div><p>Demo only. No payment, shipping, or taxes are charged.</p><button class="button button-dark" id="checkout">Demo checkout <span>↗</span></button><button class="continue-button" data-close>Continue exploring</button></div></dialog><dialog id="info-dialog" class="info-dialog" aria-labelledby="info-title"><button class="icon-button close-corner" data-close aria-label="Close information">×</button><span class="eyebrow">THE DETAILS</span><h2 id="info-title"></h2><div id="info-content"></div></dialog><dialog id="zoom-dialog" class="zoom-dialog" aria-labelledby="zoom-title"><div class="zoom-heading"><span id="zoom-title"></span><button class="icon-button" data-close aria-label="Close enlarged image">×</button></div><img id="zoom-image" alt=""><div class="zoom-controls"><button class="icon-button" id="zoom-prev" aria-label="Previous enlarged image">←</button><span id="zoom-counter"></span><button class="icon-button" id="zoom-next" aria-label="Next enlarged image">→</button></div></dialog>`;
  $('#open-bag').addEventListener('click', () => openDialog($('#bag-dialog')));
  document.addEventListener('click', event => {
    const closer = event.target.closest('[data-close]');
    if (closer) closeDialog(closer.closest('dialog'));
    const info = event.target.closest('[data-info]');
    if (info) showInfo(info.dataset.info);
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
}
function showInfo(type) {
  const dialog = $('#info-dialog');
  dialog.classList.remove('sole-comparison-dialog');
  if (type === 'soles' && product?.optionType === 'sole') {
    dialog.classList.add('sole-comparison-dialog');
    $('#info-title').textContent = 'CHANGE YOUR FOUNDATION.';
    $('#info-content').innerHTML = soleComparisonMarkup(product, selectedVariant);
    bindSoleComparison($('#info-content'), variant => {
      chooseVariant(variant); dialog.close();
      document.querySelector(`[data-variant="${variant}"]`).focus();
    });
    openDialog(dialog); return;
  }
  const info = {
    sizing: ['FIND YOUR SIZE', `<p>Choose your usual EU size to explore this concept. Sizes 39 through 46 are available in the demonstration.</p><ol><li>Stand on a sheet of paper with your heel against a wall.</li><li>Mark the end of your longest toe and measure heel to toe.</li><li>Measure both feet and use the longer measurement.</li></ol><p class="info-note">This fictional shoe has no verified foot-length chart or fit testing. We do not claim that it fits true to size. A real purchase would require a verified product-specific size chart.</p>`],
    delivery: ['DELIVERY & RETURNS', '<p>LOW-KEY is a fictional concept store. You can explore the shoes, choose options, and try the bag and checkout flow.</p><p>No payment is collected, no order is placed, and no products are shipped. Shipping costs, delivery dates, and return terms do not apply to this demonstration.</p>'],
  }[type];
  if (!info) return;
  $('#info-title').textContent = info[0];
  $('#info-content').innerHTML = info[1];
  openDialog($('#info-dialog'));
}
function renderBag() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $('#bag-count').textContent = count;
  $('#open-bag').setAttribute('aria-label', `Open shopping bag, ${count} ${count===1?'item':'items'}`);
  $('#bag-number').textContent = `(${count})`;
  $('#bag-subtotal').textContent = `${money(subtotal(cart))} USD`;
  $('#checkout').disabled = cart.length === 0;
  $('#bag-items').innerHTML = cart.length ? cart.map((item, index) => {
    const p = PRODUCTS[item.product]; const v = variantOf(item);
    return `<article class="bag-item"><a href="${p.page}?variant=${v.id}&size=${item.size}" class="bag-image" aria-label="View ${p.name}"><img src="${imagePath(v.images[0],true)}" alt="${p.name}, ${v.name}" width="240" height="160"></a><div class="bag-item-content"><div class="bag-item-title"><h3>${p.name}</h3><strong>${money(v.price * item.qty)}</strong></div><p>${p.optionType==='color'?v.color:v.name+' / '+v.color}</p><p>EU ${item.size} · ${money(v.price)} each</p><div class="bag-item-actions"><div class="quantity"><button data-qty="-1" data-index="${index}" aria-label="Decrease quantity of ${p.name}">−</button><span>${item.qty}</span><button data-qty="1" data-index="${index}" aria-label="Increase quantity of ${p.name}" ${item.qty>=99?'disabled':''}>+</button></div><button class="remove-button" data-remove="${index}" aria-label="Remove ${p.name} from bag">Remove</button></div></div></article>`;
  }).join('') : '<div class="empty-bag"><span aria-hidden="true">↗</span><h3>AN OPEN POSSIBILITY.</h3><p>Your bag is empty. Find your everyday original.</p><a class="button button-dark" href="index.html#collection">Explore the collection ↗</a></div>';
}
function setupBag() {
  $('#bag-items').addEventListener('click', event => {
    const qty = event.target.closest('[data-qty]');
    const remove = event.target.closest('[data-remove]');
    if (!qty && !remove) return;
    const index = +(qty ? qty.dataset.index : remove.dataset.remove);
    if (remove) cart.splice(index, 1);
    else { cart[index].qty += +qty.dataset.qty; if (cart[index].qty < 1) cart.splice(index, 1); }
    saveCart(); renderBag();
    const target = qty && $(`[data-qty="${qty.dataset.qty}"][data-index="${index}"]`);
    (target || $('#bag-dialog [data-close]')).focus();
  });
  $('#checkout').addEventListener('click', () => {
    if (!cart.length) return;
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    $('#bag-dialog').close();
    $('#info-dialog').classList.remove('sole-comparison-dialog');
    $('#info-title').textContent = 'ALL STYLE. NO CHARGE.';
    $('#info-content').innerHTML = `<p class="checkout-summary">${count} ${count===1?'pair':'pairs'} · ${money(subtotal(cart))} USD</p><p>This is a demonstration checkout. No order has been placed and no payment has been taken. Your items remain in your bag.</p><button class="button button-dark" data-close>Keep exploring ↗</button>`;
    openDialog($('#info-dialog'));
  });
  window.addEventListener('storage', event => { if (event.key === 'low-key-store-v2') { cart = readCart(storage); renderBag(); } });
}
function galleryDescription() { return `${product.name}, ${product.variants[selectedVariant].name}, ${ANGLES[angle].toLowerCase()} view`; }
function renderGallery(animateChange = false) {
  const variant = product.variants[selectedVariant];
  const main = $('#main-image');
  main.src = imagePath(variant.images[angle]); main.alt = galleryDescription();
  if (animateChange && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const requested = main.src;
    main.decode().then(() => {
      if (main.src !== requested) return;
      main.getAnimations().forEach(animation => animation.cancel());
      main.animate([{ opacity: .35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    }).catch(() => {});
  }
  $('#angle-name').textContent = ANGLES[angle]; $('#image-counter').textContent = `${String(angle+1).padStart(2,'0')} / 03`;
  $('#gallery-thumbs').innerHTML = variant.images.map((name, index) => `<button type="button" class="thumbnail" data-angle="${index}" aria-label="View ${ANGLES[index].toLowerCase()} of ${product.name}, ${variant.name}" aria-pressed="${index===angle}"><img src="${imagePath(name,true)}" alt="" width="240" height="160"><span>${ANGLES[index]}</span></button>`).join('');
  if ($('#zoom-dialog').open) updateZoom();
}
function updateZoom() {
  $('#zoom-image').src = imagePath(product.variants[selectedVariant].images[angle]);
  $('#zoom-image').alt = galleryDescription(); $('#zoom-title').textContent = `${product.name} / ${product.variants[selectedVariant].name}`;
  $('#zoom-counter').textContent = `${ANGLES[angle]} · ${angle+1} / 3`;
}
function moveAngle(delta) { angle = (angle + delta + 3) % 3; renderGallery(); }
function renderSelection() {
  const variant = product.variants[selectedVariant];
  if (product.optionType === 'sole') renderSoleImpact($('#sole-impact'), product, selectedVariant);
  $('#product-price').textContent = money(variant.price);
  $('#mobile-price').textContent = money(variant.price);
  $('#selected-sole').textContent = variant.name;
  if (product.optionType === 'color') $('#product-color').textContent = variant.color;
  $('#selection-summary').textContent = `${variant.name} · ${selectedSize ? 'EU '+selectedSize : 'Choose your size'}`;
  $('#mobile-add').textContent = selectedSize ? 'Add to bag ↗' : 'Choose size ↗';
  document.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.variant===selectedVariant)));
  document.querySelectorAll('[data-size]').forEach(button => button.setAttribute('aria-pressed',String(+button.dataset.size===selectedSize)));
}
function chooseVariant(variant) {
  if (!product?.variants[variant] || variant === selectedVariant) return;
  selectedVariant = variant; renderSelection(); renderGallery(true);
  $('#variant-status').textContent = `${product.variants[variant].name} selected. Three matching images available. Price ${money(product.variants[variant].price)}.`;
}
function addSelected() {
  if (!selectedSize) { $('#size-error').hidden = false; document.querySelector('[data-size]').focus(); $('#size-section').scrollIntoView({behavior:motion,block:'center'}); return; }
  addItem(cart, { product:productId, variant:selectedVariant, size:selectedSize });
  saveCart(); renderBag(); openDialog($('#bag-dialog'));
}
function setupProduct() {
  $('#product-title').textContent = product.name;
  $('#breadcrumb-product').textContent = product.shortName;
  $('#product-category').textContent = product.category;
  $('#product-description').textContent = product.description;
  $('#product-color').textContent = product.color;
  $('#material-specs').innerHTML = product.materials.map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('');
  $('#product-note').textContent = product.detailNote;
  $('#product-story-title').innerHTML = product.storyTitle.split('\n').join('<br>');
  $('#product-story-text').textContent = product.story;
  $('.story-spec>span').textContent = product.optionType==='color'?'THE COLORWAY':'THE FOUNDATION';
  $('#product-lifestyle').src = product.campaign;
  $('#product-lifestyle').alt = productId==='pace' ? 'Runner wearing bone and charcoal LK-007 sneakers with acid-lime PEBA soles on a waterfront at golden hour' : 'Burgundy LK-009 sneakers worn with relaxed jeans on a city step';
  $('#variant-options').innerHTML = Object.values(product.variants).map(v=>`<button type="button" class="variant-button" data-variant="${v.id}" aria-pressed="${v.id===selectedVariant}"><span class="variant-name"><span class="sole-dot ${v.id}"></span>${v.name}</span><span class="variant-price">${money(v.price)}</span><span class="variant-description">${v.description}</span><span class="variant-check" aria-hidden="true">✓</span></button>`).join('');
  if (product.optionType === 'color') {
    $('#sole-help').hidden = true; $('#sole-legend').textContent = 'CHOOSE COLOR';
    $('#variant-options').classList.add('color-options');
    $('#variant-options').innerHTML = Object.values(product.variants).map(v => `<button type="button" class="color-button" data-variant="${v.id}" aria-pressed="${v.id===selectedVariant}"><span class="color-dot" style="background:${v.swatch}"></span><span>${v.name}</span><span class="color-check" aria-hidden="true">✓</span></button>`).join('');
  }
  $('#size-options').innerHTML = Array.from({length:8},(_,i)=>`<button type="button" data-size="${i+39}" aria-pressed="false" aria-label="EU size ${i+39}">${i+39}</button>`).join('');
  $('#variant-options').addEventListener('click', event => { const button = event.target.closest('[data-variant]'); if (button) chooseVariant(button.dataset.variant); });
  $('#size-options').addEventListener('click',event=>{const button=event.target.closest('[data-size]');if(!button)return;selectedSize=+button.dataset.size;$('#size-error').hidden=true;renderSelection();});
  $('#product-form').addEventListener('submit',event=>{event.preventDefault();addSelected();});
  $('#mobile-add').addEventListener('click',addSelected);
  $('#gallery-thumbs').addEventListener('click',event=>{const button=event.target.closest('[data-angle]');if(!button)return;angle=+button.dataset.angle;renderGallery();document.querySelector(`[data-angle="${angle}"]`).focus();});
  $('#gallery-prev').addEventListener('click',()=>moveAngle(-1)); $('#gallery-next').addEventListener('click',()=>moveAngle(1));
  $('#enlarge-image').addEventListener('click',()=>{updateZoom();openDialog($('#zoom-dialog'));});
  $('#zoom-prev').addEventListener('click',()=>moveAngle(-1)); $('#zoom-next').addEventListener('click',()=>moveAngle(1));
  $('#zoom-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();moveAngle(-1);}if(event.key==='ArrowRight'){event.preventDefault();moveAngle(1);}});
  const barObserver = new IntersectionObserver(entries=>{ $('#mobile-purchase').classList.toggle('visible',!entries[0].isIntersecting); }, {threshold:0});
  barObserver.observe($('#main-purchase'));
  const other = PRODUCTS[productId==='pace'?'court':'pace']; const otherVariant=Object.values(other.variants)[0];
  $('#other-product').innerHTML = `<a href="${other.page}" class="other-image" aria-label="Explore ${other.name}"><img src="${imagePath(otherVariant.images[0])}" alt="${other.name} sneaker" loading="lazy" width="1200" height="800"></a><div><span class="eyebrow">ANOTHER SIDE OF LOW-KEY</span><h2>${other.shortName}.</h2><p>${other.id==='court'?'Your off-duty original. Rich suede. Bone leather. Gum sole.':'A technical expression. Two sole concepts. Your choice.'}</p><a class="text-link" href="${other.page}">Explore ${other.shortName} <span>↗</span></a></div>`;
  renderSelection(); renderGallery();
}
renderShell(); renderBag(); setupBag(); if(product)setupProduct(); else setupCampaignJourney();
