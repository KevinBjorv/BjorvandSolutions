const filtersContainer = document.getElementById('categoryFilters');
const grid = document.getElementById('assetGrid');
const count = document.getElementById('assetCount');
const emptyState = document.getElementById('assetEmpty');

const formatLabel = value =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const normalizeCategory = value => value.trim().toLowerCase();

const buildCategoryData = rankings => {
  const siteCategories = {};
  const categoryRanks = {};
  const normalizedLabels = {};

  Object.entries(rankings).forEach(([category, rankedSites]) => {
    const normalized = normalizeCategory(category);
    normalizedLabels[normalized] = category;
    categoryRanks[normalized] = {};

    rankedSites.forEach(entry => {
      if (!siteCategories[entry.site_id]) {
        siteCategories[entry.site_id] = new Map();
      }
      siteCategories[entry.site_id].set(normalized, category);
      categoryRanks[normalized][entry.site_id] = entry.rank;
    });
  });

  return { siteCategories, categoryRanks, normalizedLabels };
};

const renderFilters = categories => {
  const allCategories = ['All', ...categories];
  allCategories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    if (index === 0) {
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.setAttribute('aria-pressed', 'false');
    }
    button.textContent = category;
    button.dataset.category = normalizeCategory(category);
    filtersContainer.appendChild(button);
  });
};

const renderCards = (sites, categoryData) => {
  const cards = [];
  Object.entries(sites).forEach(([siteId, site]) => {
    const categoryEntries = categoryData.siteCategories[siteId];
    const categories = categoryEntries ? Array.from(categoryEntries.values()) : [];
    const normalizedCategories = categoryEntries
      ? Array.from(categoryEntries.keys())
      : [];
    categories.sort((a, b) => a.localeCompare(b));
    normalizedCategories.sort();

    const card = document.createElement('article');
    card.className = 'card asset-card';
    card.dataset.categories = normalizedCategories.join('|');
    card.dataset.siteId = siteId;

    const image = document.createElement('div');
    image.className = 'asset-image';
    image.setAttribute('aria-hidden', 'true');
    image.innerHTML = '<span>Image placeholder</span>';

    const body = document.createElement('div');
    body.className = 'asset-card-body';

    const title = document.createElement('h3');
    title.textContent = site.name;

    const description = document.createElement('p');
    description.textContent = site.short_description;

    const meta = document.createElement('div');
    meta.className = 'asset-meta';
    meta.innerHTML = `
      <span class="meta-pill">Pricing: ${formatLabel(site.free_level)}</span>
      <span class="meta-pill">Commercial: ${formatLabel(site.commercial_use)}</span>
    `;

    const notes = document.createElement('p');
    notes.className = 'asset-notes';
    notes.textContent = site.license_notes;

    const tags = document.createElement('div');
    tags.className = 'asset-tags';
    if (categories.length > 0) {
      categories.forEach(category => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = category;
        tags.appendChild(tag);
      });
    } else {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = 'General';
      tags.appendChild(tag);
    }

    const actions = document.createElement('div');
    actions.className = 'asset-actions';
    const link = document.createElement('a');
    link.className = 'button ghost';
    link.href = site.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Visit website';
    actions.appendChild(link);

    body.append(title, description, meta, notes, tags, actions);
    card.append(image, body);
    grid.appendChild(card);
    cards.push(card);
  });
  return cards;
};

const applyFilter = (cards, category, categoryRanks) => {
  let visibleCount = 0;
  const rankMap = categoryRanks[category] || {};
  cards.forEach(card => {
    const categories = card.dataset.categories
      ? card.dataset.categories.split('|').filter(Boolean)
      : [];
    const matches = category === 'all' || categories.includes(category);
    card.hidden = !matches;
    if (matches && category !== 'all') {
      const rank = rankMap[card.dataset.siteId] ?? Number.MAX_SAFE_INTEGER;
      card.style.order = String(rank);
    } else {
      card.style.order = '';
    }
    if (matches) visibleCount += 1;
  });

  if (count) {
    count.textContent = `${visibleCount} website${visibleCount === 1 ? '' : 's'} shown`;
  }
  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
};

const updateActiveButton = category => {
  filtersContainer.querySelectorAll('.filter-button').forEach(button => {
    const isActive = button.dataset.category === category;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const init = async () => {
  if (!filtersContainer || !grid || !count) return;

  try {
    const response = await fetch('assets/AssetWebsitesList.json');
    const data = await response.json();

    const categoryData = buildCategoryData(data.rankings_by_category);
    renderFilters(data.categories);
    const cards = renderCards(data.sites, categoryData);

    const setCategory = category => {
      updateActiveButton(category);
      applyFilter(cards, category, categoryData.categoryRanks);
    };

    filtersContainer.addEventListener('click', event => {
      const button = event.target.closest('.filter-button');
      if (!button) return;
      setCategory(button.dataset.category || 'all');
    });

    setCategory('all');
  } catch (error) {
    count.textContent = 'Unable to load asset websites right now.';
  }
};

init();
