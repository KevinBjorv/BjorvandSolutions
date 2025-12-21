const randomButton = document.getElementById('randomIdeaButton');
const ideaBadge = document.getElementById('idea-badge');
const ideaName = document.getElementById('idea-name');
const ideaDescription = document.getElementById('idea-description');
const ideaCore = document.getElementById('idea-core');
const ideaLoop = document.getElementById('idea-loop');
const ideaWin = document.getElementById('idea-win');
const ideaLose = document.getElementById('idea-lose');
const ideaPrototypes = document.getElementById('idea-prototypes');
const ideaLearning = document.getElementById('idea-learning');
const ideaRelevance = document.getElementById('idea-relevance');
const ideaList = document.getElementById('ideaList');
const ideaDifficulty = document.getElementById('idea-difficulty');
const ideaDimension = document.getElementById('idea-dimension');
const ideaAssets = document.getElementById('idea-assets');
const ideaScope = document.getElementById('idea-scope');

let ideas = [];

const buildList = (items, formatter) => {
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = formatter(item);
    fragment.appendChild(listItem);
  });
  return fragment;
};

const renderIdea = idea => {
  ideaBadge.textContent = `Idea #${idea.id}`;
  ideaName.textContent = idea.name;
  ideaDescription.textContent = idea.short_description;
  ideaCore.textContent = idea.core_mechanic;
  ideaLoop.textContent = idea.gameplay_loop;
  ideaWin.textContent = idea.win_conditions;
  ideaLose.textContent = idea.lose_conditions;

  ideaPrototypes.innerHTML = '';
  ideaPrototypes.appendChild(
    buildList(idea.prototypes, prototype => `<strong>${prototype.name}:</strong> ${prototype.goal}`)
  );

  ideaLearning.innerHTML = '';
  ideaLearning.appendChild(buildList(idea.learning_focus, item => item));

  ideaRelevance.innerHTML = '';
  ideaRelevance.appendChild(buildList(idea.future_game_relevance, item => item));
};

const renderIdeaCatalog = () => {
  ideaList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  ideas.forEach(idea => {
    const details = document.createElement('details');
    details.className = 'card idea-details';

    const summary = document.createElement('summary');
    summary.className = 'idea-summary';
    summary.innerHTML = `<span>Idea #${idea.id}</span><strong>${idea.name}</strong>`;
    details.appendChild(summary);

    const description = document.createElement('p');
    description.className = 'idea-summary-description';
    description.textContent = idea.short_description;
    details.appendChild(description);

    const meta = document.createElement('dl');
    meta.className = 'idea-meta';
    meta.innerHTML = `
      <div>
        <dt>Core mechanic</dt>
        <dd>${idea.core_mechanic}</dd>
      </div>
      <div>
        <dt>Gameplay loop</dt>
        <dd>${idea.gameplay_loop}</dd>
      </div>
      <div>
        <dt>Win conditions</dt>
        <dd>${idea.win_conditions}</dd>
      </div>
      <div>
        <dt>Lose conditions</dt>
        <dd>${idea.lose_conditions}</dd>
      </div>
    `;
    details.appendChild(meta);

    const blocks = document.createElement('div');
    blocks.className = 'idea-blocks';

    const prototypes = document.createElement('div');
    prototypes.className = 'idea-block';
    prototypes.innerHTML = '<h3>Prototype steps</h3>';
    const prototypeList = document.createElement('ul');
    prototypeList.appendChild(
      buildList(idea.prototypes, prototype => `<strong>${prototype.name}:</strong> ${prototype.goal}`)
    );
    prototypes.appendChild(prototypeList);

    const learning = document.createElement('div');
    learning.className = 'idea-block';
    learning.innerHTML = '<h3>Learning focus</h3>';
    const learningList = document.createElement('ul');
    learningList.appendChild(buildList(idea.learning_focus, item => item));
    learning.appendChild(learningList);

    const relevance = document.createElement('div');
    relevance.className = 'idea-block';
    relevance.innerHTML = '<h3>Future game relevance</h3>';
    const relevanceList = document.createElement('ul');
    relevanceList.appendChild(buildList(idea.future_game_relevance, item => item));
    relevance.appendChild(relevanceList);

    blocks.appendChild(prototypes);
    blocks.appendChild(learning);
    blocks.appendChild(relevance);
    details.appendChild(blocks);

    fragment.appendChild(details);
  });

  ideaList.appendChild(fragment);
};

const pickRandomIdea = () => {
  if (ideas.length === 0) return;
  const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
  renderIdea(randomIdea);
};

const loadIdeas = async () => {
  const response = await fetch('assets/smartindie_first_game_ideas.json');
  const data = await response.json();
  ideas = data.ideas;

  ideaDifficulty.textContent = data.difficulty;
  ideaDimension.textContent = data.constraints.dimension;
  ideaAssets.textContent = data.constraints.asset_guideline;
  ideaScope.textContent = data.constraints.scope_guideline;

  renderIdeaCatalog();
  pickRandomIdea();
};

if (randomButton) {
  randomButton.addEventListener('click', pickRandomIdea);
}

loadIdeas();
