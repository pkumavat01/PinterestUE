// pinterest-masonry.js
// Custom block for Pinterest-style masonry layout, mobile-first

export default function decorate(block) {
  // Add 'long' and 'block' classes for styling
  block.classList.add('long', 'block');

  // Find the list of cards (assume ul > li structure)
  const ul = block.querySelector('ul');
  if (!ul) return;

  // Make sure all li are styled for masonry
  ul.querySelectorAll('li').forEach(li => {
    li.style.display = 'inline-block';
    li.style.width = '100%';
    li.style.margin = '0 0 20px';
    li.style.borderRadius = '8px';
    li.style.transition = 'transform 0.2s';
    li.style.position = 'relative';
    li.style.breakInside = 'avoid';
  });

  // Responsive: columns for mobile-first
  function setColumns() {
    if (window.innerWidth < 600) {
      ul.style.columns = '1';
    } else if (window.innerWidth < 900) {
      ul.style.columns = '2';
    } else {
      ul.style.columns = '3';
    }
    ul.style.columnGap = '14px';
    ul.style.padding = '0';
  }
  setColumns();
  window.addEventListener('resize', setColumns);

  // Add block-specific class for CSS targeting
  block.classList.add('pinterest-masonry');
}
