export default function decorate(block) {
  block.classList.add('cards-carousel');
  const cards = Array.from(block.children[0]?.children || []);
  const track = document.createElement('div');
  track.className = 'cards-carousel-track';
  cards.forEach(card => {
    card.classList.add('cards-carousel-card');
    // Optionally wrap card content for styling
    const body = document.createElement('div');
    body.className = 'cards-carousel-card-body';
    while (card.firstChild) body.appendChild(card.firstChild);
    card.appendChild(body);
    track.appendChild(card);
  });
  block.textContent = '';
  block.appendChild(track);

  // Add arrows
  const left = document.createElement('button');
  left.className = 'cards-carousel-arrow left';
  left.setAttribute('aria-label', 'Scroll left');
  left.innerHTML = '&#8592;';
  const right = document.createElement('button');
  right.className = 'cards-carousel-arrow right';
  right.setAttribute('aria-label', 'Scroll right');
  right.innerHTML = '&#8594;';
  block.append(left, right);

  let position = 0;
  const cardWidth = () => track.querySelector('.cards-carousel-card')?.offsetWidth || 300;
  const maxPosition = () => Math.max(0, cards.length - Math.floor(block.offsetWidth / cardWidth()));

  function update() {
    track.style.transform = `translateX(${-position * (cardWidth() + 16)}px)`;
    left.disabled = position === 0;
    right.disabled = position >= maxPosition();
  }

  left.addEventListener('click', () => {
    position = Math.max(0, position - 1);
    update();
  });
  right.addEventListener('click', () => {
    position = Math.min(maxPosition(), position + 1);
    update();
  });

  // Touch/drag support
  let startX = 0, scrollStart = 0, dragging = false;
  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    scrollStart = position;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const delta = Math.round(-dx / (cardWidth() + 16));
    position = Math.min(maxPosition(), Math.max(0, scrollStart + delta));
    update();
  });
  track.addEventListener('pointerup', () => { dragging = false; });
  track.addEventListener('pointerleave', () => { dragging = false; });

  window.addEventListener('resize', update);
  update();
}
