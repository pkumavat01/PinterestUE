import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cardDivs = [...row.children];
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Assign classes to children
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    // Extract and apply custom card variation class (e.g., 'big-card')
    const classDiv = cardDivs[cardDivs.length - 1]; // Last div has the classes
    if (classDiv && classDiv.textContent.includes(',')) {
      const classes = classDiv.textContent.split(',').map(s => s.trim()); // ['card', 'big-card']
      classes.forEach((cls) => {
        if (cls && cls !== 'card') li.classList.add(cls); // Add only meaningful classes
      });
    }

    ul.append(li);
  });

  // Replace images with optimized versions
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
