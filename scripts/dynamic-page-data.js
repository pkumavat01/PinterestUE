// This script dynamically loads data from /data/<pagename>.json and renders it using the Pinterest Masonry and Carousel card styles.
// Place this script in each sub page (e.g., cars, makeup, animals) and ensure the correct CSS is loaded.

function getPageName() {
  // Assumes URL is /<something>/<pagename> or /<pagename>
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[path.length - 1];
}

async function loadPageData() {
  const pageName = getPageName();
  const dataUrl = `/data/${pageName}.json`;
  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error('Data not found');
    const data = await res.json();
    renderMasonry(data);
    renderCarousel(data);
  } catch (e) {
    document.querySelector('.masonry-container')?.replaceChildren('No data found.');
    document.querySelector('.carousel-container')?.replaceChildren('No data found.');
  }
}

function renderMasonry(data) {
  const container = document.querySelector('.masonry-container');
  if (!container || !Array.isArray(data)) return;
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'masonry block';
  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cards-card-image">
        <img src="${item.image}" alt="${item.title || ''}" />
      </div>
      <div class="cards-card-body">
        <div><p>${item.title || ''}</p></div>
        <div><p>${item.description || ''}</p></div>
      </div>
    `;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

function renderCarousel(data) {
  const container = document.querySelector('.carousel-container');
  if (!container || !Array.isArray(data)) return;
  container.innerHTML = '';
  const carousel = document.createElement('div');
  carousel.className = 'carousel block';
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.innerHTML = `
      <div class="cards-card-image">
        <img src="${item.image}" alt="${item.title || ''}" />
      </div>
      <div class="cards-card-body">
        <div><p>${item.title || ''}</p></div>
        <div><p>${item.description || ''}</p></div>
      </div>
    `;
    carousel.appendChild(card);
  });
  container.appendChild(carousel);
}

document.addEventListener('DOMContentLoaded', loadPageData);
