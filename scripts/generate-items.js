const fs = require('fs');
const path = require('path');

const BASES = [
  { id: 'mountain', name: 'Mountain' },
  { id: 'river', name: 'River' },
  { id: 'town', name: 'Town' },
  { id: 'car', name: 'Car' },
  { id: 'moon', name: 'Moon' },
  { id: 'cave', name: 'Cave' },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'ball', name: 'Ball' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'book', name: 'Book' },
];

const FILTERS = [
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'crimson', name: 'Crimson', css: 'hue-rotate(320deg) saturate(1.6)' },
  { id: 'emerald', name: 'Emerald', css: 'hue-rotate(90deg) saturate(1.4)' },
  { id: 'azure', name: 'Azure', css: 'hue-rotate(180deg) saturate(1.4)' },
  { id: 'golden', name: 'Golden', css: 'sepia(0.6) saturate(2) hue-rotate(-20deg)' },
  { id: 'violet', name: 'Violet', css: 'hue-rotate(250deg) saturate(1.6)' },
  { id: 'midnight', name: 'Midnight', css: 'brightness(0.55) saturate(1.3) hue-rotate(220deg)' },
  { id: 'inferno', name: 'Inferno', css: 'hue-rotate(-30deg) saturate(2.2) contrast(1.2) brightness(1.1)' },
  { id: 'frost', name: 'Frost', css: 'hue-rotate(190deg) saturate(0.7) brightness(1.3) contrast(0.9)' },
  { id: 'spectral', name: 'Spectral', css: 'invert(0.82) hue-rotate(180deg) saturate(1.5)' },
];

const TOTAL = BASES.length * FILTERS.length; // 100
const RARITY_COUNTS = { common: 60, uncommon: 30, rare: 10 };

function buildRarityPool() {
  const pool = [];
  for (const [rarity, count] of Object.entries(RARITY_COUNTS)) {
    for (let i = 0; i < count; i++) pool.push(rarity);
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function generate() {
  const pool = buildRarityPool();
  if (pool.length !== TOTAL) {
    throw new Error(`Rarity pool size (${pool.length}) must equal base*filter combos (${TOTAL})`);
  }

  const combos = [];
  for (const base of BASES) {
    for (const filter of FILTERS) {
      combos.push({ base, filter });
    }
  }

  const items = combos.map(({ base, filter }, index) => ({
    id: `${base.id}-${filter.id}`,
    name: `${filter.name} ${base.name}`,
    image: `images/${base.id}.svg`,
    filter: filter.css,
    rarity: pool[index],
  }));

  const outPath = path.join(__dirname, '..', 'public', 'data', 'items.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} items to ${outPath}`);

  const summary = items.reduce((acc, it) => {
    acc[it.rarity] = (acc[it.rarity] || 0) + 1;
    return acc;
  }, {});
  console.log('Rarity distribution:', summary);
}

generate();
