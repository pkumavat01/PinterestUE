import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    // Add heart icon button (default: :heart:, toggle to :heart-fill:)
    const heartBtn = document.createElement('button');
    heartBtn.type = 'button';
    heartBtn.className = 'heart-btn';
    heartBtn.setAttribute('aria-label', 'Favorite');
    // Default icon is :heart:
    heartBtn.innerHTML = '<span class="icon icon-heart"></span>';
    heartBtn.addEventListener('click', function() {
      const icon = heartBtn.querySelector('span');
      if (icon.classList.contains('icon-heart')) {
        icon.classList.remove('icon-heart');
        icon.classList.add('icon-heart-fill');
      } else {
        icon.classList.remove('icon-heart-fill');
        icon.classList.add('icon-heart');
      }
    });
    li.appendChild(heartBtn);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
  block.classList.add('masonry','block' );
}
