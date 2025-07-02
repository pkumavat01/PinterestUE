export default function decorate(block) {
  // Find the main wrapper for the login page
  const loginPage = document.querySelector('.login-page');
  if (!loginPage) return;

  // Find the default-content-wrapper containing Username/Password labels
  const wrapper = loginPage.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  // Replace Username/Password <p> with label+input
  const ps = wrapper.querySelectorAll('p');
  ps.forEach((p) => {
    if (/username/i.test(p.textContent)) {
      const label = document.createElement('label');
      label.textContent = 'Username';
      label.setAttribute('for', 'login-username');
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'login-username';
      input.name = 'username';
      input.autocomplete = 'username';
      input.required = true;
      p.replaceWith(label, input);
    }
    if (/password/i.test(p.textContent)) {
      const label = document.createElement('label');
      label.textContent = 'Password';
      label.setAttribute('for', 'login-password');
      const input = document.createElement('input');
      input.type = 'password';
      input.id = 'login-password';
      input.name = 'password';
      input.autocomplete = 'current-password';
      input.required = true;
      p.replaceWith(label, input);
    }
  });

  // Find the login button and add submit logic
  const loginBtn = wrapper.querySelector('a.button, button.button');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const username = wrapper.querySelector('#login-username')?.value;
      const password = wrapper.querySelector('#login-password')?.value;
      if (username && password) {
        localStorage.setItem('loginUser', JSON.stringify({ username }));
        // Optionally redirect or show a message
        window.location.href = '/ideas';
      } else {
        alert('Please enter both username and password.');
      }
    });
  }
}
