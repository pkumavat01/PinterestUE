import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  // Apply container class from the last <div> in the block (cards, grid, etc.)
  const containerClassDiv = block.querySelector(':scope > div:last-child');
  if (containerClassDiv && containerClassDiv.textContent.includes(',')) {
    const containerClasses = containerClassDiv.textContent.split(',').map(s => s.trim());
    containerClasses.forEach(cls => {
      if (cls && cls !== 'cards') block.classList.add(cls);
    });
  }

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cardDivs = [...row.children];
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    ul.append(li);
  });

  // Optimize all <img> inside <picture>
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
