import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'small-cards-list';
  const cardsPerBatch = 10;
  let currentBatch = 1;
  
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
  block.appendChild(ul);
}
