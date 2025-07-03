import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'small-cards-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'small-card';
    moveInstrumentation(row, li);
    let imgDiv = null;
    let labelDiv = null;
    [...row.children].forEach((div) => {
      if (div.querySelector('picture')) {
        imgDiv = div;
        imgDiv.className = 'small-card-image';
      } else {
        labelDiv = div;
        labelDiv.className = 'small-card-label';
      }
    });
    if (imgDiv) {
      li.appendChild(imgDiv);
      if (labelDiv) {
        labelDiv.style.position = 'absolute';
        labelDiv.style.top = '50%';
        labelDiv.style.left = '50%';
        labelDiv.style.transform = 'translate(-50%, -50%)';
        labelDiv.style.textAlign = 'center';
        labelDiv.style.width = '100%';
        labelDiv.style.color = '#fff';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.pointerEvents = 'none';
        imgDiv.style.position = 'relative';
        imgDiv.appendChild(labelDiv);
      }
    }
    ul.appendChild(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: '200' },
      { width: '400' }
    ], { quality: 85 });
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.appendChild(ul);
}
