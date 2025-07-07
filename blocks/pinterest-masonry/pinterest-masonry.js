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

function renderFavorites(block, likedItems, userLikesKey) {
  const ul = document.createElement('ul');
  block.textContent = '';
  block.appendChild(ul);
  block.classList.add('masonry', 'block');

  if (likedItems.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No pins found.';
    msg.style.textAlign = 'center';
    msg.style.padding = '40px';
    msg.style.fontWeight = 'bold';
    block.appendChild(msg);
    return;
  }

  likedItems.forEach((item) => {
    const li = document.createElement('li');

    const imgDiv = document.createElement('div');
    imgDiv.className = 'cards-card-image';
    const picture = createOptimizedPicture(item.id, item.title, false, [{ width: '750' }]);
    imgDiv.appendChild(picture);

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
}

function renderMasonry(block, likedItems, userLikesKey) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    let imageDiv = null;
    let cardImageUrl = '';
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    // Collect all <a> tags in the row for the carousel
    const allAnchors = row.querySelectorAll('a');
    const links = Array.from(allAnchors);
    let linksFromJson = null;
    if (row.dataset && row.dataset.links) {
      try {
        linksFromJson = JSON.parse(row.dataset.links);
      } catch (e) { /* ignore */ }
    }

    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        imageDiv = div;
        imageDiv.className = 'cards-card-image';
        const img = div.querySelector('img');
        if (img) cardImageUrl = img.src;
      } else {
        // Remove all <a> tags from the clone before appending to bodyDiv
        const divClone = div.cloneNode(true);
        divClone.querySelectorAll('a').forEach(a => a.remove());
        bodyDiv.appendChild(divClone);
      }
    });

    // Prefer links from JSON if available
    let finalLinks = links;
    if (Array.isArray(linksFromJson) && linksFromJson.length > 0) {
      finalLinks = linksFromJson.map(linkObj => {
        const a = document.createElement('a');
        a.href = linkObj.url;
        a.textContent = linkObj.text;
        a.className = 'carousel-link';
        return a;
      });
    }

    // Create carousel if links exist, or add dummy links if none
    let carouselDiv = null;
    if (finalLinks.length > 0) {
      carouselDiv = document.createElement('div');
      carouselDiv.className = 'button-carousel';
      finalLinks.forEach(link => {
        link.classList.add('carousel-link');
        carouselDiv.appendChild(link);
      });
    } else {
      // Add dummy links for demo
      carouselDiv = document.createElement('div');
      carouselDiv.className = 'button-carousel';
      for (let i = 1; i <= 5; i++) {
        const dummyLink = document.createElement('a');
        dummyLink.href = '#';
        dummyLink.textContent = `Link ${i}`;
        dummyLink.className = 'carousel-link';
        carouselDiv.appendChild(dummyLink);
      }
    }

    const likeDiv = bodyDiv.querySelector('.icon-heart');
    if (likeDiv) {
      likeDiv.classList.add('masonry-heart');
      likeDiv.style.cursor = 'pointer';
      li.appendChild(likeDiv);

      if (isLiked(cardImageUrl, likedItems)) {
        likeDiv.classList.add('liked');
        likeDiv.querySelector('img').src = '/icons/heart-fill.svg';
      }

      likeDiv.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('user'))?.username;
        if (!currentUser) {
          alert('You must be logged in to like a pin!');
          return;
        }
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
    if (carouselDiv) li.appendChild(carouselDiv);
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

export default async function decorate(block) {
  const currentUser = JSON.parse(localStorage.getItem('user'))?.username;
  let likedItems = [];
  let userLikesKey = '';

  if (currentUser) {
    userLikesKey = `likes-${currentUser}`;
    likedItems = JSON.parse(localStorage.getItem(userLikesKey)) || [];
  }

  // Always render the masonry layout, even for guests
  if (document.body.classList.contains('favorites-page')) {
    renderFavorites(block, likedItems, userLikesKey);
  } else {
    renderMasonry(block, likedItems, userLikesKey);
  }
}
