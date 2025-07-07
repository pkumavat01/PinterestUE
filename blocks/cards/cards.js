import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  const cardsPerBatch = 3;
  let currentBatch = 1;
  
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
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Get all cards
  const allCards = [...ul.children];
  const totalCards = allCards.length;
  
  // Initially hide cards beyond the first batch
  allCards.forEach((card, index) => {
    if (index >= cardsPerBatch) {
      card.style.display = 'none';
    }
  });

  // Find the existing "See more" button in the parent section
  const parentSection = block.closest('.section');
  const existingButton = parentSection ? parentSection.querySelector('.button') : null;
  
  if (existingButton && totalCards > cardsPerBatch) {
    // Add click event to existing button
    existingButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior
      
      const startIndex = currentBatch * cardsPerBatch;
      const endIndex = Math.min(startIndex + cardsPerBatch, totalCards);
      
      // Show next batch of cards
      for (let i = startIndex; i < endIndex; i++) {
        if (allCards[i]) {
          allCards[i].style.display = 'block';
          // Add fade-in animation
          allCards[i].style.opacity = '0';
          allCards[i].style.transform = 'translateY(20px)';
          setTimeout(() => {
            allCards[i].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            allCards[i].style.opacity = '1';
            allCards[i].style.transform = 'translateY(0)';
          }, 50);
        }
      }
      
      currentBatch++;
      
      // Hide button if all cards are shown
      if (endIndex >= totalCards) {
        existingButton.style.display = 'none';
      }
    });
  }

  block.textContent = '';
  block.append(ul);
}
