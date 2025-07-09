/* eslint-disable linebreak-style */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Use semantic <section> for the carousel block
  const section = document.createElement('section');
  section.className = 'carousel-section';
  section.setAttribute('aria-label', 'carousel');
  section.style.width = '100%';

  const ul = document.createElement('ul');
  ul.setAttribute('role', 'list');
  ul.className = 'carousel-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');
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
      colorDiv.remove();
    }
    li.classList.add('carousel-card');
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Carousel controls (buttons with aria-label and sr-only text)
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '<span aria-hidden="true">‹</span><span class="sr-only">Previous slide</span>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<span aria-hidden="true">›</span><span class="sr-only">Next slide</span>';

  const scrollAmount = 300;

  prevBtn.addEventListener('click', () => {
    ul.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    ul.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Clear block and append semantic structure
  block.textContent = '';
  section.append(prevBtn, ul, nextBtn);
  block.append(section);
  block.classList.add('carousel', 'block');
}
