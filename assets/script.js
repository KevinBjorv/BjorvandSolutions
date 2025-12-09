const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu() {
  if (!mobileMenu || !burger) return;
  const isOpen = mobileMenu.style.display === 'flex';
  mobileMenu.style.display = isOpen ? 'none' : 'flex';
  burger.setAttribute('aria-expanded', String(!isOpen));
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
