export default function decorate(block) {
  // Mobile-first, semantic, accessible accordion using <details> and <summary>
  const accordionDetails = [...block.children].map((el) => {
    const [titleEl, contentEl] = [...el.children];
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.innerHTML = titleEl ? titleEl.innerHTML : '';
    summary.setAttribute('tabindex', '0');
    summary.setAttribute('aria-expanded', 'false');
    summary.setAttribute('role', 'button');
    // Accessibility: summary toggles aria-expanded
    summary.addEventListener('click', () => {
      const expanded = details.hasAttribute('open');
      summary.setAttribute('aria-expanded', String(!expanded));
    });
    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        summary.click();
      }
    });
    details.appendChild(summary);
    if (contentEl) {
      const contentSection = document.createElement('div');
      contentSection.className = 'accordion-content';
      contentSection.innerHTML = contentEl.innerHTML;
      details.appendChild(contentSection);
    }
    return details;
  });
  block.innerHTML = '';
  accordionDetails.forEach((details) => { block.appendChild(details); });
}
