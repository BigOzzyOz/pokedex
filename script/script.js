let baseURL = 'https://pokeapi.co/api/v2/';
let paths, type, poke, evolution;
let currentId = 0;
const types = [];
const evolutionChain = [];
const pokemon = [];

async function init() {
  let screen = document.querySelectorAll('#topScreenInfo, #smallScreenInfo');
  let loadItem;
  if (localStorage.getItem('pokemon') && localStorage.getItem('types') && localStorage.getItem('evolutionChain')) {
    await getAndPushStorage('types', types);
    await getAndPushStorage('evolutionChain', evolutionChain);
    await getAndPushStorage('pokemon', pokemon);
    renderPokemonCards();
    renderPokemonBars();
    screen.forEach(element => { element.classList.toggle('d-none'); });
    document.getElementById('defaultTab').click();
  } else {
    setTimeout(start, 5000);
  }
}

async function finishDownload() {
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.classList.toggle('d-none');
  topScreenInfo.innerHTML = htmlSaveQuestion();
  let response = await getUserResponse();
  if (response) {
    setlocal('types', types);
    setlocal('evolutionChain', evolutionChain);
    setlocal('pokemon', pokemon);
    topScreenInfo.innerHTML = htmlSaveFinish();
  } else {
    topScreenInfo.innerHTML = htmlSaveAbort();
  };
}

function getUserResponse() {
  return new Promise((resolve) => {
    window.resolveUserResponse = resolve;
  });
}

function userResponse(response) {
  if (window.resolveUserResponse) {
    window.resolveUserResponse(response);
  }
}

function renderPokemonBars(id = currentId, pokeArray = pokemon) {
  let currentSet = [pokeArray[id - 4], pokeArray[id - 3], pokeArray[id - 2], pokeArray[id - 1], pokeArray[id], pokeArray[id + 1], pokeArray[id + 2], pokeArray[id + 3], pokeArray[id + 4]];
  let bars = document.getElementById('barView');
  currentId = id;
  bars.innerHTML = '';

  for (let i = 0; i < currentSet.length; i++) {
    bars.innerHTML += htmlRenderBars(currentSet[i] == undefined ? 'hidden' : currentSet[i]);
    changeClass(0, i);
  }
  renderTopScreen();
  pokemonBg('.pokeBar');
}

async function renderPokemonCards(pokeArray = pokemon) {
  let cards = document.getElementById('cardView');
  let pagination = document.getElementById('pagination');
  cards.innerHTML = '';
  pagination.innerHTML = '';
  for (let i = 0; i < pokeArray.length; i++) {
    let page = Number(Math.floor(i / 100 + 1)).toFixed();
    document.getElementById(`cardView${page}`) == null ? htmlCreateCardPage(page) : null;
    document.getElementById(`cardView${page}`).innerHTML += htmlRenderCards(pokeArray, i);
  }
  pokemonBg('.pokeCard');
}

function openCard(page, element) {
  let cards = document.querySelectorAll('.cardView');
  let currentCard = document.getElementById(`cardView${page}`);
  let pagination = document.querySelectorAll('.pagination a');
  cards.forEach(card => {
    card.classList.remove('d-none');
    card.classList.add('d-none');
  });
  pagination.forEach(num => {
    num.classList.remove('active');
  });
  currentCard.classList.remove('d-none');
  element.classList.add('active');
}

function renderSingleCard(pokeArray = pokemon, i) {
  let page = Number(Math.floor(i / 100 + 1)).toFixed();
  document.getElementById(`cardView${page}`) == null ? htmlCreateCardPage(page) : null;
  document.getElementById(`cardView${page}`).innerHTML += htmlRenderCards(pokeArray, i);
  pokemonBgSingle(`pokemon${i}`);
}

function changePoke(pokeId) {
  currentId = pokemon.findIndex(element => element.id == pokeId);
  let screen = document.getElementById('barView').classList.contains('d-none') ? 'cardView' : 'barView';
  if (screen == 'barView') {
    renderPokemonBars();
  } else {
    renderTopScreen();
  }
}

async function renderLoadingbar() {
  let loadBar = document.getElementById('loadProgress');
  let text = document.getElementById('loadProgressText');
  text.innerHTML = `${pokemon.length} von ${poke.results.length} Pokemon geladen`;
  loadBar.style.width = `${Number((pokemon.length / poke.results.length) * 100).toFixed(1)}%`;
}

function searchPokemon() {
  let searchInput = document.getElementById('search').value;
  searchInput = searchInput.toLowerCase();
  let screen = document.getElementById('barView').classList.contains('d-none') ? 'cardView' : 'barView';
  if (screen == 'barView') {
    searchBarView(searchInput);
  } else {
    searchCardView(searchInput);
  }
}

function searchBarView(searchInput) {
  let searchId = pokemon.findIndex((pokemons) =>
    pokemons.name.toLowerCase().includes(searchInput) || String(pokemons.id).toLowerCase().padStart(4, '0').includes(searchInput)
  );
  currentId = searchId == -1 ? currentId : searchId;
  renderPokemonBars();
  renderTopScreen();
}

function searchCardView(searchInput) {
  const pokeArray = [];
  pokemon.forEach(pokemons => {
    pokemons.name.toLowerCase().includes(searchInput) || String(pokemons.id).toLowerCase().padStart(4, '0').includes(searchInput) ? pokeArray.push(pokemons) : null;
  });
  let firstPoke = pokeArray.length == 0 ? pokemon[currentId].name : pokeArray[0].name;
  searchId = pokemon.findIndex(element => element.name == firstPoke);
  currentId = searchId == -1 ? currentId : searchId;
  renderPokemonCards(pokeArray);
  renderTopScreen();
}

function showMenu(window) {
  let id = document.getElementById(window);
  id.style.transform = 'translate(0, 0)';
  id.classList.remove('d-none');
}

function closeMenu(window) {
  let id = document.getElementById(window);
  id.style.transform = 'translate(100%, 0)';
  id.classList.add('d-none');
}

function changeView(view) {
  let image = document.getElementById(view);
  let barView = document.getElementById('barView');
  let cardView = document.getElementById('cardView');
  let pagination = document.getElementById('pagination');
  barView.classList.toggle('d-none');
  pagination.classList.toggle('d-none');
  cardView.classList.toggle('d-none');
  cardView.classList.contains('d-none') ? null : document.getElementById('defaultCard').click();
  image.src = image.src.indexOf('table') != -1 ? 'assets/icons/bars-solid.svg' : 'assets/icons/table-cells-solid.svg';
}

function move(event) {
  let direction = event.deltaY == undefined ? event : event.deltaY;
  let poke = document.querySelectorAll('.pokeBar');
  if ((currentId == 0 && direction < 0) || (currentId == pokemon.length - 1 && direction > 0)) {
    return;
  } else {
    for (let i = 0; i < poke.length; i++) {
      poke[i].style.translate = `0 ${direction > 0 ? '-14.3%' : '14.3%'}`;
      changeClass(direction, i);
    }
    direction > 0 ? currentId++ : currentId--;
    setTimeout(renderPokemonBars, 200);
    setTimeout(pokemonBg, 201, '.pokeBar');
  }
}

function pokemonBg(selector) {
  let pokemons = document.querySelectorAll(selector);
  pokemons.forEach(pokeBar => {
    let type1 = pokeBar.dataset.type1 ? pokeBar.dataset.type1.toLowerCase() : null;
    let type2 = pokeBar.dataset.type2 ? pokeBar.dataset.type2.toLowerCase() : null;
    if (type1 && type2) {
      pokeBar.style.background = `linear-gradient(45deg, var(--${type1}) 60%, var(--${type2}) 75%)`;
    } else if (type1) {
      pokeBar.style.background = `var(--${type1})`;
    } else if (type2) {
      pokeBar.style.background = `var(--${type2})`;
    }
  });
}

function pokemonBgSingle(pokeId) {
  let pokemons = document.getElementById(pokeId);
  let type1 = pokemons.dataset.type1 ? pokemons.dataset.type1.toLowerCase() : null;
  let type2 = pokemons.dataset.type2 ? pokemons.dataset.type2.toLowerCase() : null;
  if (type1 && type2) {
    pokemons.style.background = `linear-gradient(45deg, var(--${type1}) 60%, var(--${type2}) 75%)`;
  } else if (type1) {
    pokemons.style.background = `var(--${type1})`;
  } else if (type2) {
    pokemons.style.background = `var(--${type2})`;
  };
}

function changeClass(direction, bar, factor = 0) {
  let currentSet = document.querySelectorAll('.pokeBar');
  const classList = ['last3', 'last2', 'last1', 'last', 'current', 'next', 'next1', 'next2', 'next3'];
  if (direction > 0 && bar >= 1) {
    currentSet[bar].classList.add(classList[bar - 1]);
    currentSet[bar].classList.remove(classList[bar]);
  } else if (direction === '14.3%' && bar < classList.length - 1) {
    currentSet[bar].classList.add(classList[bar + 1]);
    currentSet[bar].classList.remove(classList[bar]);
  } else {
    currentSet[bar - factor].classList.add(classList[bar]);
  };
}

function openPage(selector, element, color) {
  let tab = document.getElementsByClassName('topTab');
  let tabLink = document.getElementsByClassName('topTabLink');
  for (let i = 0; i < tabLink.length; i++) {
    tab[i].style.display = 'none';
    tabLink[i].style.backgroundColor = '';
  }
  document.getElementById(selector).style.display = 'flex';
  element.style.backgroundColor = color;
}

function renderTopScreen(pokemonId = currentId) {
  let misc = document.getElementById('misc');
  let stats = document.getElementById('stats');
  misc.innerHTML = htmlrenderMisc(pokemonId);
  stats.innerHTML = htmlrenderStats(pokemonId);
  renderEvo(pokemonId);
}

function renderDamage(pokemonId = currentId, damageMulti, x) {
  let poke = x == 'type1' ? types[types.findIndex((element) => element.origin === pokemon[pokemonId].type1)] : types[types.findIndex((element) => element.origin === pokemon[pokemonId].type2)];
  let countertype = [];
  if (poke == undefined || poke.damage[damageMulti].length == 0) {
    return '';
  } else {
    countertype.push(htmlDamageEmpty('start'));
    for (let i = 0; i < poke.damage[damageMulti].length; i++) {
      let counterPoke = types[types.findIndex((element) => element.origin === poke.damage[damageMulti][i].name)];
      countertype.push(htmlDamageList(counterPoke));
    }
    countertype.push(htmlDamageEmpty('end'));
    return countertype.join('');
  }
}

function renderEvo(pokemonId = currentId) {
  let evoChainId = evolutionChain.findIndex(ele => pokemon[pokemonId].evolution == ele.id);
  let evoContainer = document.getElementById('evo');
  evoContainer.innerHTML = '';
  renderEvoContainer(evoContainer, 'base', evoChainId);
  if (evolutionChain[evoChainId].firstEvolution != undefined && evolutionChain[evoChainId].firstEvolution.length != 0) {
    renderEvoContainer(evoContainer, 'firstEvolution', evoChainId);
  } if (evolutionChain[evoChainId].secondEvolution != undefined) {
    renderEvoContainer(evoContainer, 'secondEvolution', evoChainId);
  }
}

function renderEvoContainer(evoContainer, step, evoChainId) {
  evoContainer.innerHTML += htmlRenderEvo(step);
  let container = document.getElementById(step);
  step == 'base' ? renderBasePoke(evoChainId, step, container) : renderEvolutionPoke(evoChainId, step, container);
}

function renderBasePoke(evoChainId, step, container) {
  let pokeName = evolutionChain[evoChainId].basePoke;
  let pokeIndex = pokemon[pokemon.findIndex(element => element.origin == pokeName)];
  container.innerHTML += htmlRenderEvoPoke(pokeIndex, step);
}

function renderEvolutionPoke(evoChainId, step, container) {
  for (let i = 0; i < evolutionChain[evoChainId][step].length; i++) {
    let pokeName = evolutionChain[evoChainId][step][i].name;
    let pokeIndex = pokemon[pokemon.findIndex(element => element.origin == pokeName)];
    container.innerHTML += htmlRenderEvoPoke(pokeIndex, step, i);
  }
}

function changeTab(x) {
  let container = document.querySelectorAll('.topTab');
  let link = document.querySelectorAll('.topTabLink');
  let currentIndex = Array.from(container).findIndex(tab => tab.style.display === 'flex');
  let newIndex;
  if (currentIndex === -1) return;

  if (x === -100) {
    newIndex = (currentIndex === 0) ? container.length - 1 : currentIndex - 1;
  } else if (x === 100) {
    newIndex = (currentIndex === container.length - 1) ? 0 : currentIndex + 1;
  }
  link[newIndex].click();
}