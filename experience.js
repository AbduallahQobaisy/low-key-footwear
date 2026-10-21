import { imagePath, money } from './catalog.js';

// A normal-flow page is the fallback. Only enhance when motion is welcome.
export function setupCampaignJourney() {
  const journey = document.querySelector('.campaign-journey');
  if (!journey) return;
  const incoming = journey.querySelector('.campaign-court');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function paint() {
    frame = 0;
    if (preference.matches) return;
    const progress = Math.max(0, Math.min(1, (innerHeight - incoming.getBoundingClientRect().top) / innerHeight));
    journey.style.setProperty('--journey-progress', progress.toFixed(4));
  }
  function schedule() { if (!frame && !preference.matches) frame = requestAnimationFrame(paint); }
  function configure() {
    journey.classList.toggle('is-animated', !preference.matches);
    if (preference.matches) {
      cancelAnimationFrame(frame); frame = 0;
      journey.style.removeProperty('--journey-progress');
    } else schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  preference.addEventListener('change', configure);
  configure();
}

export function renderSoleImpact(panel, product, variantId) {
  if (!panel || panel.dataset.variant === variantId) return;
  const variant = product.variants[variantId];
  const base = product.variants.eva.price;
  panel.dataset.variant = variantId;
  panel.innerHTML = `<div class="sole-impact-heading"><span class="eyebrow">DESIGN INTENT</span><span>${variant.price===base?'Base sole':`+${money(variant.price-base)} vs EVA`}</span></div><strong class="sole-impact-title">${variant.intent}</strong><p>${variant.intentDetail}</p><div class="sole-impact-bottom"><span>${variant.name} / ${variant.color}</span><strong>${money(variant.price)} USD</strong></div><p class="sole-context-note">Concept goals, not measured shoe-performance ratings.</p>`;
}

export function soleComparisonMarkup(product, selected) {
  const eva = product.variants.eva;
  const peba = product.variants.peba;
  return `<p class="comparison-intro">Same upper. Two different foundations. Slide between the sole designs, then choose the direction that suits you.</p>
    <div class="sole-comparison-labels"><span>EVA / Ivory</span><span>PEBA / Acid lime</span></div>
    <div class="sole-wipe" style="--split:50%"><img draggable="false" class="wipe-base" src="${imagePath(peba.images[0])}" alt="LK-007 PEBA sole in acid lime"><img draggable="false" class="wipe-overlay" src="${imagePath(eva.images[0])}" alt="LK-007 EVA sole in ivory"><span class="wipe-divider" aria-hidden="true"><span>↔</span></span></div>
    <label class="comparison-slider-label" for="sole-reveal">Slide to compare the sole designs</label><input id="sole-reveal" class="sole-reveal" type="range" min="0" max="100" value="50" aria-valuetext="50 percent EVA, 50 percent PEBA">
    <div class="sole-compare-grid">${[eva,peba].map(v=>`<article class="sole-compare-card ${selected===v.id?'is-selected':''}"><div><h3>${v.name}</h3><strong>${money(v.price)}</strong></div><span class="comparison-intent">${v.intent}</span><p>${v.intentDetail}</p><p class="comparison-geometry">${v.description}</p><button class="button ${selected===v.id?'button-selected':'button-dark'}" type="button" data-use-sole="${v.id}">${selected===v.id?'Keep':'Choose'} ${v.name}<span>${selected===v.id?'✓':'↗'}</span></button></article>`).join('')}</div>
    <p class="material-context">PEBA-family formulations are used for low-energy-loss, responsive running foams. Actual feel depends on the formulation and shoe construction; LK-007 has no tested performance rating. <a href="https://pebaxpowered.arkema.com/en/pebax-technology/" target="_blank" rel="noopener noreferrer">Material background (Arkema) ↗</a></p>`;
}

export function bindSoleComparison(container, choose) {
  const range = container.querySelector('#sole-reveal');
  const wipe = container.querySelector('.sole-wipe');
  function paintSplit() {
    wipe.style.setProperty('--split', `${range.value}%`);
    range.setAttribute('aria-valuetext', `${range.value} percent EVA, ${100-Number(range.value)} percent PEBA`);
  }
  range.addEventListener('input', paintSplit);
  // Native image dragging can cancel the pointer gesture and create a ghost image.
  wipe.addEventListener('dragstart', event => event.preventDefault());
  let dragging = null;
  function drag(event) {
    const rect = wipe.getBoundingClientRect();
    range.value = String(Math.round(Math.max(0, Math.min(100, (event.clientX-rect.left)/rect.width*100))));
    paintSplit();
  }
  wipe.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = event.pointerId;
    wipe.setPointerCapture(event.pointerId);
    range.focus({ preventScroll:true });
    drag(event);
  });
  wipe.addEventListener('pointermove', event => { if (dragging === event.pointerId) drag(event); });
  function stop(event) { if (event.pointerId === dragging) dragging = null; }
  wipe.addEventListener('pointerup', stop);
  wipe.addEventListener('pointercancel', stop);
  wipe.addEventListener('lostpointercapture', stop);
  container.querySelectorAll('[data-use-sole]').forEach(button => button.addEventListener('click', () => choose(button.dataset.useSole)));
}
