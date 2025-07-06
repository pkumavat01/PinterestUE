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
        div.className = 'carousel-card-image';
      } else {
        div.className = 'carousel-card-body';
      }
    });
    // Set background color if color field is present
    const colorDiv = li.querySelector('.carousel-card-body div[data-name="color"], .carousel-card-body p[data-name="color"]');
    if (colorDiv && colorDiv.textContent) {
      li.style.backgroundColor = colorDiv.textContent.trim();
      colorDiv.style.display = 'none';
    }
    li.classList.add('carousel-card');
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Carousel controls
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Next');

  let scrollAmount = 300;

  prevBtn.addEventListener('click', () => {
    ul.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    ul.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  block.textContent = '';
  block.append(prevBtn, ul, nextBtn);
  block.classList.add('carousel', 'block');
}
