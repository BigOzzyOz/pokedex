let baseURL = 'https://pokeapi.co/api/v2/';
let paths, type, poke;
let currentId = 0;
const types = getLocal('types');
const pokemon = getLocal('pokemon');

function setlocal(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

function getLocal(key) {
  let item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  } else {
    return [];
  }
}

function init() {
  let screen = document.querySelectorAll('#topScreenInfo, #smallScreenInfo');
  if (pokemon.length == 1025 && types.length == 20) {
    renderPokemonCards();
    renderPokemonBars();
    screen.forEach(element => { element.classList.toggle('d-none'); });
  } else {
    start();
  }
}

async function start() {
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.innerHTML = htmlStart();
  let response = await getUserResponse();
  if (response) {
    startDowload();
  } else {
    topScreenInfo.innerHTML = htmlAbort();
  };
}

async function startDowload() {
  let screen = document.querySelectorAll('#topScreenInfo, #smallScreenInfo');
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.innerHTML = htmlContinue();
  let waitDownload = getData();
  let intervalId = setInterval(() => {
    if (pokemon.length >= 20) {
      clearInterval(intervalId);
      renderPokemonBars();
      screen.forEach(element => { element.classList.toggle('d-none'); });
    };
  }, 100);
  await waitDownload;
  finishDownload();
}

async function finishDownload() {
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.classList.toggle('d-none');
  topScreenInfo.innerHTML = htmlSaveQuestion();
  let response = await getUserResponse();
  if (response) {
    setlocal('types', types);
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

function htmlSaveQuestion() {
  return /*html*/`
    <p>Möchtest du dein Datenset speichern um nächstes mal schneller loszulegen?</p>
    <div>
      <button onclick="userResponse(true)">JA</button>
      <button onclick="userResponse(false)">NEIN</button>
    </div>
  `;
};

function htmlSaveFinish() {
  return /*html*/`
    <p>Daten wurden gespeichert viel Spaß auf deiner Reise.</p>
    <button onclick="document.getElementById('topScreenInfo').classList.toggle('d-none')">Schließen</button>
  `;
}

function htmlSaveAbort() {
  return /*html*/`
  <p>Daten wurden nicht gespeichert viel Spaß auf deiner Reise.</p>
  <button onclick="document.getElementById('topScreenInfo').classList.toggle('d-none')">Schließen</button>
`;
}

function htmlStart() {
  return /*html*/`
    <p>Bisher sind noch keine Einträge in deinem Pokedex vorhanden.</p>
    <p>Möchtest du Professor Eich um Hilfe Fragen und dir das Aktuelle Datenset herunterladen?</p>
    <div>
      <button onclick="userResponse(true)">JA</button>
      <button onclick="userResponse(false)">NEIN</button>
    </div>
  `;
}

function htmlContinue() {
  return /*html*/`
    <p>Daten werder Geladen. Es beginnt sobald genügend Daten vorhanden sind</p>
  `;
}

function htmlAbort() {
  return /*html*/`
    <p>Schade, viel Spaß auf deiner Reise. Solltest du es dir anders Überlegen Starte das Gerät neu</p>
  `;
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
  pokemonBg('.pokeBar');
}

function renderPokemonCards(pokeArray = pokemon) {
  let cards = document.getElementById('cardView');
  cards.innerHTML = '';
  for (let i = 0; i < pokeArray.length; i++) {
    cards.innerHTML += htmlRenderCards(pokeArray, i);
  }
  pokemonBg('.pokeCard');
}

function renderSingleCard(pokeArray = pokemon, i) {
  let cards = document.getElementById('cardView');
  cards.innerHTML += htmlRenderCards(pokeArray, i);
  pokemonBgSingle(`pokemon${i}`);
}

function htmlRenderBars(pokeIndex = pokemon[currentId]) {
  if (pokeIndex == 'hidden') {
    return /*html*/`
      <div class="pokeBar"></div>
    `;
  } else {
    return /*html*/`
    <div class="pokeBar" data-type1=${pokeIndex.type1} ${pokeIndex.type2 !== '' ? `data-type2=${pokeIndex.type2}` : ''}>
      <div class="barStatus">
        <p class="PokeId">${String(pokeIndex.id).padStart(4, '0')}</p>
        <img src="${pokeIndex.imgSmall}" alt="image of ${pokeIndex.origin}">
        <p class="pokeName">${pokeIndex.name}</p>
      </div>
      <div class="barType">
        <img src="${types[types.findIndex((element) => element.origin === pokeIndex.type1)].img}" alt="${pokeIndex.type1}TypeImage">
        ${pokeIndex.type2 !== '' ? `<img src="${types[types.findIndex((element) => element.origin === pokeIndex.type2)].img}" alt="${pokeIndex.type1}TypeImage">` : ''}
      </div>
    </div>
    `;
  }
}

function htmlRenderCards(pokeArray = pokemon, pokeId = 0) {
  return /*html*/`
    <div id="pokemon${pokeId}" class="pokeCard" data-type1=${pokeArray[pokeId].type1} ${pokeArray[pokeId].type2 !== '' ? `data-type2=${pokeArray[pokeId].type2}` : ''}>
      <div class="cardStatus">
        <p class="PokeId">${String(pokeArray[pokeId].id).padStart(4, '0')}</p>
        <img src="${pokeArray[pokeId].imgSmall}" alt="image of ${pokeArray[pokeId].origin}">
        <p class="pokeName">${pokeArray[pokeId].name}</p>
      </div>
      <div class="cardType">
      <img
        src="${types[types.findIndex((element) => element.origin === pokeArray[pokeId].type1)].img}" alt="${pokeArray[pokeId].type1}TypeImage">
        ${pokeArray[pokeId].type2 !== '' ? `<img src="${types[types.findIndex((element) => element.origin === pokeArray[pokeId].type2)].img}" alt="${pokeArray[pokeId].type1}TypeImage">` : ''}
  </div>
</div>
`;
}

async function renderLoadingbar() {
  let loadBar = document.getElementById('loadProgress');
  let text = document.getElementById('loadProgressText');
  text.innerHTML = `${pokemon.length} von ${poke.results.length} Pokemon geladen`;
  loadBar.style.width = `${Number((pokemon.length / poke.results.length) * 100).toFixed(1)}%`;
}

async function getTypes(paths) {
  document.getElementById('ledYellow').classList.add('aniStart');
  try {
    response = await fetch(paths.type);
    type = await response.json();
    for (let i = 0; i < type.results.length; i++) {
      response = await fetch(type.results[i].url);
      typeInfo = await response.json();
      pushType(typeInfo);
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    document.getElementById('ledYellow').classList.remove('aniStart');
  }
}

function pushType(typeInfo) {
  types.push({
    'id': typeInfo.id,
    'origin': typeInfo.name,
    'name': typeInfo.names[typeInfo.names.findLastIndex((element) => element.language.name == 'de')]?.name ?? 'Unbekannt',
    'img': `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/lets-go-pikachu-lets-go-eevee/${typeInfo.id}.png`
  });
}

async function getPokemon(poke) {
  document.getElementById('ledGreen').classList.toggle('aniStart');
  const id = setInterval(renderLoadingbar, 2500);
  try {
    await createPokemon(poke);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    clearInterval(id);
    document.getElementById('loadbar').classList.toggle('d-none');
    document.getElementById('ledGreen').classList.toggle('aniStart');
    return;
  }
}

async function createPokemon(poke) {
  for (let i = 0; i < poke.results.length; i++) {
    let response = await fetch(poke.results[i].url);
    let newMon = await response.json();
    response = await fetch(newMon.species.url);
    let newMon2 = await response.json();
    response = await fetch(newMon2.evolution_chain.url);
    let evoChain = await response.json();
    pushPokemon(newMon, newMon2, evoChain);
    renderSingleCard(pokemon, i);
  }
}

function pushPokemon(info, species, chain) {
  pokemon.push({
    'id': info.id,
    'origin': info.name,
    'name': species.names[species.names.findLastIndex((element) => element.language.name == 'de')].name,
    'type1': info.types[0].type.name,
    'type2': info.types[1]?.type?.name ?? '',
    'height': info.height,
    'weight': info.weight,
    'imgSmall': info.sprites.other.showdown.front_default == null ? info.sprites.front_default : info.sprites.other.showdown.front_default,
    'imgBig': info.sprites.other.home.front_default,
    'stats': {
      'hp': info.stats[0].base_stat,
      'attack': info.stats[1].base_stat,
      'defense': info.stats[2].base_stat,
      'spAttack': info.stats[3].base_stat,
      'spDefense': info.stats[4].base_stat,
      'speed': info.stats[5].base_stat,
    },
    'flavorText': species.flavor_text_entries[species.flavor_text_entries.findLastIndex((element) => element.language.name == 'de')]?.flavor_text ?? 'Über dieses Pokemon ist nichts bekannt',
    'genus': species.genera[species.genera.findLastIndex((element) => element.language.name == 'de')]?.genus ?? 'Unbekannt',
    'evolution': chain,
  });
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
  currentId = pokemon.findIndex((pokemons) =>
    pokemons.name.toLowerCase().includes(searchInput) || String(pokemons.id).toLowerCase().padStart(4, '0').includes(searchInput)
  );
  renderPokemonBars();
}

function searchCardView(searchInput) {
  const pokeArray = [];
  pokemon.forEach(pokemons => {
    pokemons.name.toLowerCase().includes(searchInput) || String(pokemons.id).toLowerCase().padStart(4, '0').includes(searchInput) ? pokeArray.push(pokemons) : null;
  });
  renderPokemonCards(pokeArray);
}


async function getData(path = baseURL) {
  document.getElementById('ledBlue').classList.toggle('aniStart');
  try {
    let response = await fetch(path);
    paths = await response.json();
    response = await fetch(paths.pokemon + '?limit=1025&offset=0');
    poke = await response.json();
    await getTypes(paths);
    await getPokemon(poke);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    document.getElementById('ledBlue').classList.toggle('aniStart');
  }
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
  barView.classList.toggle('d-none');
  cardView.classList.toggle('d-none');
  image.src = image.src.indexOf('table') != -1 ? 'assets/icons/bars-solid.svg' : 'assets/icons/table-cells-solid.svg';
}

function move(event) {
  let direction = event.deltaY == undefined ? event : event.deltaY;
  let poke = document.querySelectorAll('.pokeBar');
  if ((currentId == 0 && direction > 0) || (currentId == pokemon.length - 1 && direction < 0)) {
    return;
  } else {
    for (let i = 0; i < poke.length; i++) {
      poke[i].style.translate = `0 ${direction < 0 ? '-14.3%' : '14.3%'}`;
      changeClass(direction, i);
    }
    direction < 0 ? currentId++ : currentId--;
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
  if (direction < 0 && bar >= 1) {
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
  document.getElementById(selector).style.display = 'block';
  element.style.backgroundColor = color;
}

function renderTopScreen() {
  document.getElementById('defaultOpen').click();
}

