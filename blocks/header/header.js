import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function getAllCards() {
  return Array.from(document.querySelectorAll('.cards > ul > li')).map((li) => {
    const link = li.querySelector('a');
    return {
      title: li.querySelector('.cards-card-body')?.textContent?.trim() || 'Untitled',
      image: li.querySelector('img')?.src,
      url: link ? link.href : '',
      element: li,
    };
  });
}
/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.classList.toggle('nav-open', !(expanded || isDesktop.matches));
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Add search input with icon at the start of nav-sections
    const searchContainer = document.createElement('div');
    searchContainer.className = 'nav-search';
    searchContainer.innerHTML = `
      <div class="nav-search">
        <img src="/icons/search.svg" alt="Search" class="nav-search-icon" />
        <input type="text" placeholder="Search..." aria-label="Search" />
        <div class="search-dropdown" style="display:none;"></div>
      </div>
    `;
    navSections.prepend(searchContainer);

    const searchInput = searchContainer.querySelector('input[type="text"]');
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.style.display = 'none';
    searchContainer.appendChild(dropdown);

    searchInput.addEventListener('focus', () => {
      const cards = getAllCards(); // or use curated suggestions
      dropdown.innerHTML = cards.slice(0, 5).map((card) => `
        <div class="search-dropdown-card" data-url="${card.url}">
          ${card.image ? `<img src="${card.image}" alt="" />` : ''}

          <span>${card.title}</span>
        </div>
      `).join('');
      dropdown.classList.add('show');
    });

    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase();
      const cards = getAllCards().filter((card) => card.title.toLowerCase().includes(value));
      dropdown.innerHTML = cards.slice(0, 5).map((card) => `
        <div class="search-dropdown-card" data-url="${card.url}">
          ${card.image ? `<img src="${card.image}" alt="" />` : ''}

          <span>${card.title}</span>
        </div>
      `).join('');
      if (cards.length) {
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => { dropdown.classList.remove('show'); }, 200); // allow click
    });

    // Add click event to navigate
    dropdown.addEventListener('click', (e) => {
      const cardDiv = e.target.closest('.search-dropdown-card');
      if (cardDiv && cardDiv.dataset.url) {
        window.location.href = cardDiv.dataset.url;
      }
    });

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // LOGIN/LOGOUT BUTTON LOGIC 
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    
    const loginBtn = navTools.querySelector('a[title="Login"]');
    const signupBtn = navTools.querySelector('a[title="Signup"]');
    const logoutBtn = navTools.querySelector('a[title="Logout"]');
    console.log('navTools', navTools, 'loginBtn', loginBtn, 'signupBtn', signupBtn, 'logoutBtn', logoutBtn);
    const user = localStorage.getItem('user');
    if (user) {
      if (loginBtn) { loginBtn.classList.add('hide'); loginBtn.classList.remove('show'); }
      if (signupBtn) { signupBtn.classList.add('hide'); signupBtn.classList.remove('show'); }
      if (logoutBtn) {
        logoutBtn.classList.remove('hide');
        logoutBtn.classList.add('show');
        if (!logoutBtn.dataset.listener) {
          logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
          });
          logoutBtn.dataset.listener = 'true';
        }
      }
    } else {
      if (loginBtn) { loginBtn.classList.remove('hide'); loginBtn.classList.add('show'); }
      if (signupBtn) { signupBtn.classList.remove('hide'); signupBtn.classList.add('show'); }
      if (logoutBtn) { logoutBtn.classList.add('hide'); logoutBtn.classList.remove('show'); }
    }
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
