import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    // Merge all .cards-card-body into one
    const bodies = li.querySelectorAll('.cards-card-body');
    if (bodies.length > 1) {
      const mainBody = bodies[0];
      for (let i = 1; i < bodies.length; i += 1) {
        while (bodies[i].firstChild) {
          mainBody.appendChild(bodies[i].firstChild);
        }
        bodies[i].remove();
      }
    }
    // Find the favorite button (with :heart: text) if present
    const favBtn = li.querySelector('button');
    if (favBtn && favBtn.textContent.trim() === ':heart:') {
      favBtn.addEventListener('click', function() {
        if (favBtn.textContent.trim() === ':heart:') {
          favBtn.textContent = ':heart-fill:';
        } else {
          favBtn.textContent = ':heart:';
        }
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
  block.classList.add('masonry','block' );
}
