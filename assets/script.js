const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobileMenu');

document.body.classList.add('is-loading');

const loader = document.createElement('div');
loader.className = 'page-loader';
loader.innerHTML = `
  <div class="loader-dot" aria-hidden="true"></div>
  <div class="loader-text">Loading</div>
`;
document.body.appendChild(loader);

function finishLoading() {
  document.body.classList.add('loaded');
  setTimeout(() => {
    loader.remove();
    document.body.classList.remove('is-loading');
  }, 500);
}

if (document.readyState === 'complete') {
  finishLoading();
} else {
  window.addEventListener('load', finishLoading);
}

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

const revealTargets = document.querySelectorAll(
  'section, .card, .hero-right, .video-wrapper, .cta-strip, .testimonial-card, .faq details, .game-card, .about-grid > *, .benefits, .promise-grid, .bonus-grid, .trust-grid'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach(element => {
  element.classList.add('reveal');
  observer.observe(element);
});
