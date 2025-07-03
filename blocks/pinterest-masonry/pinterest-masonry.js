import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isLiked(cardId, likedItems) {
  return likedItems.some(item => item.id === cardId);
}

function getCardDetails(imageUrl, bodyDiv) {
  const title = bodyDiv.querySelector('div:nth-child(1) p')?.textContent.trim() || '';
  const description = bodyDiv.querySelector('div:nth-child(2) p')?.textContent.trim() || '';
  return { id: imageUrl, title, description };
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  const currentUser = JSON.parse(localStorage.getItem('user'))?.username;
  if (!currentUser) return;

  const userLikesKey = `likes-${currentUser}`;
  const likedItems = JSON.parse(localStorage.getItem(userLikesKey)) || [];

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    let imageDiv = null;
    let cardImageUrl = '';
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        imageDiv = div;
        imageDiv.className = 'cards-card-image';
        const img = div.querySelector('img');
        if (img) cardImageUrl = img.src;
      } else {
        bodyDiv.appendChild(div);
      }
    });

    const likeDiv = bodyDiv.querySelector('.icon-heart');
    if (likeDiv) {
      likeDiv.style.cursor = 'pointer';

      // Restore liked state
      if (isLiked(cardImageUrl, likedItems)) {
        likeDiv.classList.add('liked');
        likeDiv.querySelector('img').src = '/icons/heart-fill.svg';
      }

      likeDiv.addEventListener('click', () => {
        const isNowLiked = likeDiv.classList.toggle('liked');
        const iconImg = likeDiv.querySelector('img');

        if (isNowLiked) {
          iconImg.src = '/icons/heart-fill.svg';
          const cardDetails = getCardDetails(cardImageUrl, bodyDiv);
          likedItems.push(cardDetails);
        } else {
          iconImg.src = '/icons/heart.svg';
          const index = likedItems.findIndex(item => item.id === cardImageUrl);
          if (index !== -1) likedItems.splice(index, 1);
        }

        localStorage.setItem(userLikesKey, JSON.stringify(likedItems));
      });
    }

    if (imageDiv) li.appendChild(imageDiv);
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
