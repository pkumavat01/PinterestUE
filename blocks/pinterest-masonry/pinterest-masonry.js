import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, cardIdx) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    let imageDiv = null;
    let iconText = '';
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        imageDiv = div;
        imageDiv.className = 'cards-card-image';
      } else if (div.classList.contains('icon-field')) {
        iconText = div.textContent.trim();
      } else {
        bodyDiv.appendChild(div);
      }
    });

    if (imageDiv) {
      if (iconText) {
        const iconNode = document.createElement('span');
        iconNode.textContent = iconText;
        imageDiv.appendChild(iconNode);
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
