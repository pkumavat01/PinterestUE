import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
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

    // Find the icon name from the UE text field and create a toggle button if present
    const iconField = bodyDiv.querySelector('[data-aue-prop="icon"]');
    if (iconField) {
      const iconText = iconField.textContent.trim();
      if (iconText.startsWith(':') && iconText.endsWith(':')) {
        const iconName = iconText.replace(/:/g, '');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-toggle-btn';
        btn.setAttribute('aria-label', `Toggle ${iconName}`);
        const span = document.createElement('span');
        span.className = `icon icon-${iconName}`;
        btn.appendChild(span);
        iconField.replaceWith(btn);
        btn.addEventListener('click', function () {
          if (span.classList.contains(`icon-${iconName}`)) {
            span.classList.remove(`icon-${iconName}`);
            span.classList.add(`icon-${iconName}-fill`);
          } else {
            span.classList.remove(`icon-${iconName}-fill`);
            span.classList.add(`icon-${iconName}`);
          }
        });
      }
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
