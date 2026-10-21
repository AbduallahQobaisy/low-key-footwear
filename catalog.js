export const PRODUCTS = {
  pace: {
    id: 'pace', page: 'lk-007.html', optionType: 'sole', name: 'LK-007', shortName: 'LK-007', category: 'Performance expression',
    description: 'A technical silhouette. Your choice of foundation. Engineered mesh, an angular signature, and two distinct sole concepts.',
    color: 'Bone / Charcoal / Acid', campaign: 'assets/v2/pace-waterfront.webp',
    variants: {
      eva: { id: 'eva', name: 'EVA foam', intent: 'Everyday cushioning', intentDetail: 'A familiar foam direction for relaxed daily miles.', price: 249, color: 'Ivory', description: 'Sculpted ivory foam. Three recessed heel details.', images: ['pace-eva-threequarter', 'pace-eva-side', 'pace-eva-outsole'] },
      peba: { id: 'peba', name: 'PEBA foam', intent: 'Rebound-focused feel', intentDetail: 'A PEBA-based concept aimed at a springier underfoot response.', price: 279, color: 'Acid lime', description: 'Lime foam. A distinct, open heel channel.', images: ['pace-peba-threequarter', 'pace-peba-side', 'pace-peba-outsole'] }
    },
    materials: [['Upper', 'Engineered mesh with fine structural overlays'], ['Signature', 'Angular LK mark in charcoal'], ['Sole', 'Choice of EVA or PEBA foam concept'], ['Outsole', 'Black rubber traction pods']],
    storyTitle: 'YOUR PACE.\nYOUR FOUNDATION.', story: 'The same upper. A different expression underfoot. Switch between two sole concepts and inspect the complete shoe from every angle.',
    detailNote: 'Fictional product. Materials are concept specifications, with no tested cushioning, speed, or energy-return claims.'
  },
  court: {
    id: 'court', page: 'lk-009.html', optionType: 'color', name: 'LK-009', shortName: 'LK-009', category: 'Everyday expression',
    description: 'Court heritage, taken your own way. Rich suede, bone leather, and a slim gum sole. An everyday original with nothing to prove.',
    color: 'Burgundy / Bone / Gum', campaign: 'assets/v2/court-campaign.webp',
    variants: {
      gum: { id: 'gum', name: 'Burgundy', price: 249, color: 'Burgundy / Bone / Gum', swatch: '#743038', description: 'Burgundy suede / Bone leather / Gum sole', images: ['court-threequarter', 'court-side', 'court-outsole'] },
      forest: { id: 'forest', name: 'Forest Green', price: 249, color: 'Forest Green / Bone / Gum', swatch: '#294330', description: 'Forest-green suede / Bone leather / Gum sole', images: ['court-forest-threequarter', 'court-forest-side', 'court-forest-outsole'] }
    },
    materials: [['Upper', 'Textured suede with stitched toe panels'], ['Signature', 'Angular LK mark in bone leather'], ['Laces & heel', 'Ivory laces and matching leather heel tab'], ['Outsole', 'Slim caramel gum rubber']],
    storyTitle: 'RETRO SOUL.\nPRESENT TENSE.', story: 'Suede you can see. Proportions that keep it simple. The LK-009 takes familiar court-shoe character in a direction entirely its own.',
    detailNote: 'An original fictional footwear design. Product imagery and material specifications illustrate the concept.'
  }
};
export const ANGLES = ['Three-quarter', 'Side profile', 'Outsole'];
export const imagePath = (name, small = false) => `assets/v2/${name}${small ? '-thumb' : ''}.webp`;
export const money = value => `$${value.toLocaleString('en-US')}`;
export const variantOf = item => PRODUCTS[item.product]?.variants[item.variant];
export const itemKey = item => [item.product, item.variant, item.size].join('|');
export function validItem(item) {
  return !!item && !!variantOf(item) && Number.isInteger(item.size) && item.size >= 39 && item.size <= 46 && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99;
}
export const subtotal = items => items.reduce((sum, item) => sum + variantOf(item).price * item.qty, 0);
export function addItem(items, item) {
  if (!validItem({ ...item, qty: 1 })) throw new Error('Choose a valid size and sole');
  const existing = items.find(row => itemKey(row) === itemKey(item));
  if (existing) existing.qty = Math.min(99, existing.qty + 1);
  else items.push({ product: item.product, variant: item.variant, size: item.size, qty: 1 });
  return items;
}
export function readCart(storage) {
  try { const data = JSON.parse(storage.getItem('low-key-store-v2') || '[]'); return Array.isArray(data) ? data.filter(validItem).map(i => ({ product:i.product, variant:i.variant, size:i.size, qty:i.qty })).slice(0,100) : []; }
  catch { return []; }
}
