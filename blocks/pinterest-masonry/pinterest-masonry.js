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

  // Responsive: columns for mobile-first, using data-columns attribute if present
  function setColumns() {
    let columns = 3; // default
    // Try to get columns from block dataset or attribute
    if (block.dataset.columns) {
      columns = parseInt(block.dataset.columns, 10) || columns;
    } else {
      // Try to find a field in the block for columns
      const columnsField = block.querySelector('[name="columns"]');
      if (columnsField && columnsField.value) {
        columns = parseInt(columnsField.value, 10) || columns;
      }
    }
    // Responsive override
    if (window.innerWidth < 600) {
      ul.style.columns = '1';
    } else if (window.innerWidth < 900) {
      ul.style.columns = Math.min(2, columns).toString();
    } else {
      ul.style.columns = columns.toString();
    }
    ul.style.columnGap = '14px';
    ul.style.padding = '0';
  }
  // Set columns from model if available
  if (block.hasAttribute('data-columns')) {
    block.dataset.columns = block.getAttribute('data-columns');
  }
  setColumns();
  window.addEventListener('resize', setColumns);

  // Add block-specific class for CSS targeting
  block.classList.add('pinterest-masonry');
}
