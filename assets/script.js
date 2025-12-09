const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

function toggleMenu() {
  if (!mobileMenu || !burger) return;
  const isOpen = mobileMenu.style.display === 'flex';
  mobileMenu.style.display = isOpen ? 'none' : 'flex';
  burger.setAttribute('aria-expanded', String(!isOpen));
}

function updateThemeLabels(theme) {
  const label = theme === 'dark' ? 'Light mode' : 'Dark mode';
  if (themeToggle) themeToggle.textContent = label;
  if (mobileThemeToggle) mobileThemeToggle.textContent = label;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('preferred-theme', theme);
  updateThemeLabels(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

if (burger) {
  burger.addEventListener('click', toggleMenu);
}

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      if (burger) burger.setAttribute('aria-expanded', 'false');
    });
  });
}

const storedTheme = localStorage.getItem('preferred-theme');
if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme('light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener('click', toggleTheme);
}
