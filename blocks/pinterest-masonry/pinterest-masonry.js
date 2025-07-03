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

export default async function decorate(block) {
  const ul = document.createElement('ul');

  const currentUser = JSON.parse(localStorage.getItem('user'))?.username;
  if (!currentUser) return;

  const userLikesKey = `likes-${currentUser}`;
  const likedItems = JSON.parse(localStorage.getItem(userLikesKey)) || [];

  // ✅ CASE 1: Favorites Page → Load from localStorage JSON
  if (document.body.classList.contains('favorites-page')) {
    block.textContent = '';
    block.appendChild(ul);
    block.classList.add('masonry', 'block');

    // If no favorites, show message
    if (likedItems.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'No pins found.';
      msg.style.textAlign = 'center';
      msg.style.padding = '40px';
      msg.style.fontWeight = 'bold';
      block.appendChild(msg);
      return;
    }

    // Render liked cards
    likedItems.forEach((item) => {
      const li = document.createElement('li');

      // Image block
      const imgDiv = document.createElement('div');
      imgDiv.className = 'cards-card-image';
      const picture = createOptimizedPicture(item.id, item.title, false, [{ width: '750' }]);
      imgDiv.appendChild(picture);

      // Body block
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'cards-card-body';

      const titleDiv = document.createElement('div');
      const titleP = document.createElement('p');
      titleP.textContent = item.title;
      titleDiv.appendChild(titleP);

      const descDiv = document.createElement('div');
      const descP = document.createElement('p');
      descP.textContent = item.description;
      descDiv.appendChild(descP);

      bodyDiv.appendChild(titleDiv);
      bodyDiv.appendChild(descDiv);

      // Heart icon
      const heart = document.createElement('span');
      heart.className = 'masonry-heart liked';
      const heartImg = document.createElement('img');
      heartImg.src = '/icons/heart-fill.svg';
      heartImg.alt = 'Unfavorite';
      heart.appendChild(heartImg);

      heart.addEventListener('click', () => {
        const index = likedItems.findIndex(like => like.id === item.id);
        if (index !== -1) {
          likedItems.splice(index, 1);
          localStorage.setItem(userLikesKey, JSON.stringify(likedItems));
          li.remove();
          if (likedItems.length === 0) {
            block.innerHTML = '';
            const msg = document.createElement('p');
            msg.textContent = 'No pins found.';
            msg.style.textAlign = 'center';
            msg.style.padding = '40px';
            msg.style.fontWeight = 'bold';
            block.appendChild(msg);
          }
        }
      });

      li.appendChild(heart);
      li.appendChild(imgDiv);
      li.appendChild(bodyDiv);
      ul.appendChild(li);
    });

    return;
  }

  // ✅ CASE 2: Normal Page → Parse HTML block cards
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
      likeDiv.classList.add('masonry-heart');
      likeDiv.style.cursor = '';
      li.appendChild(likeDiv);

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
    ul.appendChild(li);
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
