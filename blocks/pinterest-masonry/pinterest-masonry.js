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
    let iconSpan = null;

    // Group all non-image content into bodyDiv, but extract icon span if present
    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        imageDiv = div;
        imageDiv.className = 'cards-card-image';
      } else {
        // If this div contains the icon span, extract it
        const foundIcon = div.querySelector('span.icon');
        if (foundIcon && !iconSpan) {
          iconSpan = foundIcon;
        } else {
          bodyDiv.appendChild(div);
        }
      }
    });

    if (imageDiv) {
      if (iconSpan) {
        // Persisted favorite logic
        const cardKey = li.dataset.aueResource || `masonry-card-${cardIdx}`;
        const img = iconSpan.querySelector('img');
        if (favorites[cardKey] === 'fill') {
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
        iconSpan.addEventListener('click', () => {
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
        imageDiv.appendChild(iconSpan);
      }
      li.appendChild(imageDiv);
    }
    if (bodyDiv.childNodes.length) li.appendChild(bodyDiv);
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
