import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  block.classList.add('cards', 'long', 'block');

  // Fetch the number of cards to display from the 'count' field (Universal Editor)
  let numCards = 0;
  const countField = block.querySelector('[name="count"]');
  if (countField && countField.value) {
    numCards = parseInt(countField.value, 10) || 0;
  }
  // If numCards is set and there are fewer cards than needed, add empty cards
  if (numCards > 0) {
    let ulEl = block.querySelector('ul');
    if (!ulEl) {
      ulEl = document.createElement('ul');
      block.appendChild(ulEl);
    }
    const currentCards = ulEl.querySelectorAll('li').length;
    for (let i = currentCards; i < numCards; i += 1) {
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="cards-card-image"><img src="" alt="" /></div>
        <div class="cards-card-body">
          <h5>Title</h5>
          <p>Description</p>
        </div>
      `;
      ulEl.appendChild(li);
    }
  }

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('masonry-card');

    const imageCell = row.querySelector('picture');
    const title = row.querySelector('h1, h2, h3, h4, h5, h6');
    const description = row.querySelector('p');

    if (imageCell) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      imageDiv.appendChild(imageCell);
      li.appendChild(imageDiv);
    }

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';
    if (title) bodyDiv.appendChild(title);
    if (description) bodyDiv.appendChild(description);

    li.appendChild(bodyDiv);
    ul.appendChild(li);
  });

  block.textContent = '';
  block.append(ul);
}
