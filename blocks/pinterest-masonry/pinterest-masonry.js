import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  block.classList.add('cards', 'long', 'block');

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
