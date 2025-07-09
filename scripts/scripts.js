import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}
export function loginPage() {
  // eslint-disable-next-line no-shadow
  const loginPage = document.body.classList.contains('login-page') ? document.body : document.querySelector('.login-page');
  if (!loginPage) return;

  const wrapper = loginPage.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const ps = wrapper.querySelectorAll('p');
  ps.forEach((p) => {
    if (/username/i.test(p.textContent)) {
      const container = document.createElement('div');
      container.classList.add('login-username-wrapper');

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'login-username';
      input.name = 'username';
      input.autocomplete = 'username';
      input.required = true;

      container.appendChild(p.cloneNode(true));
      container.appendChild(input);
      wrapper.replaceChild(container, p);
    }

    if (/password/i.test(p.textContent)) {
      const container = document.createElement('div');
      container.classList.add('login-password-wrapper');

      const input = document.createElement('input');
      input.type = 'password';
      input.id = 'login-password';
      input.name = 'password';
      input.autocomplete = 'current-password';
      input.required = true;

      container.appendChild(p.cloneNode(true));
      container.appendChild(input);
      wrapper.replaceChild(container, p);
    }
  });

  const loginBtn = wrapper.querySelector('a.button, button.button');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const username = wrapper.querySelector('#login-username')?.value.trim();
      const password = wrapper.querySelector('#login-password')?.value.trim();
      if (username && password) {
        localStorage.setItem('user', JSON.stringify({ username }));
        window.location.href = '/ideas';
      } else {
        alert('Please enter both username and password.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.login-page')) {
    loginPage();
  }
});

loadPage();
