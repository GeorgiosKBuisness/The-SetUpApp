(async function () {
  const crateButton = document.getElementById('crate-button');
  const carouselWindow = document.getElementById('carousel-window');
  const carouselTrack = document.getElementById('carousel-track');
  const resultCard = document.getElementById('result-card');
  const resultImage = document.getElementById('result-image');
  const resultName = document.getElementById('result-name');
  const resultRarity = document.getElementById('result-rarity');
  const againButton = document.getElementById('again-button');

  const ITEM_WIDTH = 140; // 120px item + 10px margin each side
  const REEL_LENGTH = 45;
  const LANDING_INDEX = 38;

  let items = [];

  async function loadItems() {
    const res = await fetch('data/items.json');
    items = await res.json();
  }

  function pickRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
  }

  function buildReel(finalItem) {
    const reel = [];
    for (let i = 0; i < REEL_LENGTH; i++) {
      reel.push(i === LANDING_INDEX ? finalItem : pickRandomItem());
    }
    return reel;
  }

  function renderReel(reel) {
    carouselTrack.innerHTML = '';
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = 'translateX(0px)';

    for (const item of reel) {
      const cell = document.createElement('div');
      cell.className = `carousel-item rarity-${item.rarity}`;

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.style.filter = item.filter;

      cell.appendChild(img);
      carouselTrack.appendChild(cell);
    }
  }

  function showResult(item) {
    resultCard.className = `result-card rarity-${item.rarity}`;
    resultImage.src = item.image;
    resultImage.style.filter = item.filter;
    resultImage.alt = item.name;
    resultName.textContent = item.name;
    resultRarity.textContent = item.rarity;
    resultCard.hidden = false;
  }

  function resetToIdle() {
    resultCard.hidden = true;
    carouselWindow.hidden = true;
    crateButton.hidden = false;
    crateButton.disabled = false;
  }

  function openCrate() {
    if (crateButton.disabled) return;

    const finalItem = pickRandomItem();
    const reel = buildReel(finalItem);
    renderReel(reel);

    crateButton.disabled = true;
    crateButton.hidden = true;
    carouselWindow.hidden = false;

    // Force reflow so the transition below actually animates from translateX(0).
    void carouselTrack.offsetWidth;

    const windowWidth = carouselWindow.clientWidth;
    const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.4);
    const targetCenter = LANDING_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    const offset = windowWidth / 2 - targetCenter + jitter;

    carouselTrack.style.transition = 'transform 3.4s cubic-bezier(0.1, 0.65, 0.15, 1)';
    carouselTrack.style.transform = `translateX(${offset}px)`;

    carouselTrack.addEventListener(
      'transitionend',
      function onDone() {
        carouselTrack.removeEventListener('transitionend', onDone);
        setTimeout(() => {
          carouselWindow.hidden = true;
          showResult(finalItem);
        }, 400);
      },
      { once: true }
    );
  }

  crateButton.addEventListener('click', openCrate);
  againButton.addEventListener('click', resetToIdle);

  await loadItems();
})();
