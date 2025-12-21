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

const revealElements = document.querySelectorAll('[data-reveal]');

if (revealElements.length > 0) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.01,
    }
  );

  revealElements.forEach(element => {
    const delay = element.getAttribute('data-reveal-delay');
    if (delay) {
      element.style.setProperty('--reveal-delay', delay);
    }
    observer.observe(element);
  });
}
