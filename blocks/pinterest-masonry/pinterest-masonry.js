import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  // Load favorites object from localStorage
  let favorites = {};
  try {
    favorites = JSON.parse(localStorage.getItem('masonry-favorites')) || {};
  } catch (e) {
    favorites = {};
  }

  [...block.children].forEach((row, cardIdx) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    let imageDiv = null;
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    // Group all non-image content into bodyDiv
    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        imageDiv = div;
        imageDiv.className = 'cards-card-image';
      } else {
        bodyDiv.appendChild(div);
      }
    });

    if (imageDiv) li.appendChild(imageDiv);
    if (bodyDiv.childNodes.length) li.appendChild(bodyDiv);

    // Directly access the icon span and toggle its class and the img src/data-icon-name on click
    const iconSpan = bodyDiv.querySelector('span.icon');
    if (iconSpan) {
      iconSpan.style.cursor = 'pointer';
      const cardKey = li.dataset.aueResource || `masonry-card-${cardIdx}`;
      // On load, set state from favorites object
      const saved = favorites[cardKey];
      const img = iconSpan.querySelector('img');
      if (saved === 'fill') {
        iconSpan.classList.remove('icon-heart');
        iconSpan.classList.add('icon-heart-fill');
        if (img) {
          img.setAttribute('data-icon-name', 'heart-fill');
          img.setAttribute('src', '/icons/heart-fill.svg');
        }
      } else {
        iconSpan.classList.remove('icon-heart-fill');
        iconSpan.classList.add('icon-heart');
        if (img) {
          img.setAttribute('data-icon-name', 'heart');
          img.setAttribute('src', '/icons/heart.svg');
        }
      }
      iconSpan.addEventListener('click', function () {
        if (iconSpan.classList.contains('icon-heart')) {
          iconSpan.classList.remove('icon-heart');
          iconSpan.classList.add('icon-heart-fill');
          if (img) {
            img.setAttribute('data-icon-name', 'heart-fill');
            img.setAttribute('src', '/icons/heart-fill.svg');
          }
          favorites[cardKey] = 'fill';
        } else {
          iconSpan.classList.remove('icon-heart-fill');
          iconSpan.classList.add('icon-heart');
          if (img) {
            img.setAttribute('data-icon-name', 'heart');
            img.setAttribute('src', '/icons/heart.svg');
          }
          delete favorites[cardKey];
        }
        localStorage.setItem('masonry-favorites', JSON.stringify(favorites));
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
  block.classList.add('masonry', 'block');
}
