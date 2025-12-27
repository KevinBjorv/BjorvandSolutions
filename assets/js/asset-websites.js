const filtersContainer = document.getElementById('categoryFilters');
const grid = document.getElementById('assetGrid');
const count = document.getElementById('assetCount');
const emptyState = document.getElementById('assetEmpty');

const bannerMap = {
  '3dtextures_me': '3dTexturesBanner.png',
  ambientcg: 'AmbientCGBanner.png',
  cgbookcase: 'CGBookcaseBanner.png',
  craftpix: 'CraftPixNetBanner.png',
  flaticon: 'FlatIconBanner.png',
  font_awesome: 'FontAwesomeBanner.png',
  free_music_archive: 'FreeMusicArchiveBanner.png',
  freesound: 'FreeSoundBanner.png',
  game_icons_net: 'GameIconsNetBanner.png',
  heroicons: 'HeroIconsBanner.png',
  itchio_cc0: 'ItchioBanner.png',
  incompetech: 'incompetechBanner.png',
  kaylousberg: 'KaylousbergBanner.png',
  kenney: 'KennyBanner.png',
  material_icons: 'GoogleFontsIconBanner.png',
  mixamo: 'MixamoBanner.png',
  opengameart: 'OpengameArtBanner.png',
  openclipart: 'OpenclipArtBanner.png',
  openverse: 'OpenverseBanner.png',
  pixabay: 'PixabayBanenr.png',
  poly_haven: 'PolyhavenBanner.png',
  polypizza: 'PolyPizzaBanne.png',
  quaternius: 'QuaterniusBanner.png',
  sharetextures: 'ShareTexturesBanner.png',
  sketchfab: 'SketchFabBanner.png',
  sonnisse_gdc: 'SonnissBanner.png',
  sonniss_gdc: 'SonnissBanner.png',
  svgrepo: 'SVGRepoBanner.png',
  texturecan: 'textureCanBanner.png',
  textures_com: 'TexturesComBanner.png',
  unity_asset_store: 'UnityassetStoreBanner.png',
  youtube_audio_library: 'YoutubeAudioLibaryBanner.png',
  zapsplat: 'ZapSplatBanner.png',
  ccmixter: 'mixterbanner.png',
  poly_haven_models: 'PolyhavenBanner.png'
};

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

    const bannerFile = bannerMap[siteId];
    if (bannerFile) {
      image.classList.add('has-banner');
      image.style.setProperty(
        '--banner-image',
        `url('../assets/assetWebsites/${bannerFile}')`
      );

      const bannerImg = document.createElement('img');
      bannerImg.className = 'asset-banner-image';
      bannerImg.src = `../assets/assetWebsites/${bannerFile}`;
      bannerImg.alt = `${site.name} banner`;
      image.appendChild(bannerImg);

      const label = document.createElement('div');
      label.className = 'asset-image-label';
      label.textContent = site.name;
      image.appendChild(label);
    } else {
      const placeholder = document.createElement('span');
      placeholder.textContent = site.name;
      image.appendChild(placeholder);
    }

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
    
    // Determine if the card matches the current filter
    const matches = category === 'all' || categories.includes(category);

    // FIX: Use inline style display to force hide/show.
    // This overrides any CSS class definitions (like display: flex) that break the [hidden] attribute.
    if (matches) {
        card.style.display = ''; // Reverts to CSS default (e.g., flex or block)
        visibleCount += 1;

        // Apply Ranking Order
        if (category !== 'all') {
            const rank = rankMap[card.dataset.siteId];
            // If rank exists use it, otherwise put at end (999)
            card.style.order = (rank !== undefined) ? rank : 999;
        } else {
            // Reset order for 'All' view so they appear naturally
            card.style.order = 0;
        }
    } else {
        card.style.display = 'none';
        card.style.order = 9999; // Push to end just in case
    }
  });

  if (count) {
    count.textContent = `${visibleCount} website${visibleCount === 1 ? '' : 's'} shown`;
  }
  if (emptyState) {
    // For the empty state container, standard hidden is usually fine, 
    // but we can use display: none to be safe.
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
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
    const response = await fetch('../assets/data/AssetWebsitesList.json');
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
    console.error(error);
    count.textContent = 'Unable to load asset websites right now.';
  }
};

init();
