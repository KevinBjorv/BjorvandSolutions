(function () {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchQuery');
  const resourceLinks = document.querySelectorAll('.resource-chip');

  function buildUrl(domain, query) {
    const trimmed = query.trim();
    const searchTerm = trimmed ? `site:${domain} ${trimmed}` : `site:${domain}`;
    return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  }

  function updateLinks(query) {
    resourceLinks.forEach((link) => {
      const domain = link.getAttribute('data-domain');
      if (!domain) return;

      const url = buildUrl(domain, query);
      link.href = url;

      if (query.trim()) {
        link.classList.remove('is-disabled');
        link.setAttribute('aria-disabled', 'false');
      } else {
        link.classList.add('is-disabled');
        link.setAttribute('aria-disabled', 'true');
      }
    });
  }

  if (searchForm && searchInput) {
    updateLinks('');

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      updateLinks(searchInput.value || '');
    });

    searchInput.addEventListener('input', (event) => {
      updateLinks(event.target.value || '');
    });
  }
})();
