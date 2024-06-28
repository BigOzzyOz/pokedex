let baseURL = 'https://pokeapi.co/api/v2/';
let paths, type, poke;
let currentId = 0;
const types = [];
const pokemon = [];

function init() {
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.innerHTML = htmlStart();
  getUserResponse().then((response) => {
    if (response) {
      topScreenInfo.innerHTML = htmlContinue();
      getData();
      let intervalId = setInterval(() => {
        if (pokemon.length >= 10) {
          clearInterval(intervalId);
          renderPokemonBars();
          document.getElementById('topScreenInfo').classList.add('d-none');
        }
      }, 100);
    } else {
      topScreenInfo.innerHTML = htmlAbort();
    }
  });
}

function getUserResponse() {
  return new Promise((resolve) => {
    window.getUserResponse = resolve;
  });
}

function htmlStart() {
  return /*html*/`
    <p>Bisher sind noch keine Einträge in deinem Pokedex vorhanden.</p>
    <p>Möchtest du Professor Eich um Hilfe Fragen und dir das Aktuelle Datenset herunterladen?</p>
    <div>
      <button onclick="getUserResponse(true)">JA</button>
      <button onclick="getUserResponse(false)">NEIN</button>
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
    bars.innerHTML += htmlRenderBars(currentSet[i] == undefined ? 1 : currentSet[i]);
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
  if (pokeIndex == 1) {
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
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    document.getElementById('ledYellow').classList.remove('aniStart');
    return;
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
  document.getElementById('ledGreen').classList.add('aniStart');
  const id = setInterval(renderLoadingbar, 2500);
  try {
    for (let i = 0; i < poke.results.length; i++) {
      response = await fetch(poke.results[i].url);
      let newMon = await response.json();
      response = await fetch(newMon.species.url);
      let newMon2 = await response.json();
      response = await fetch(newMon2.evolution_chain.url);
      let evoChain = await response.json();
      pushPokemon(newMon, newMon2, evoChain);
      renderSingleCard(pokemon, i);
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    clearInterval(id);
    document.getElementById('loadbar').classList.add('d-none');
    document.getElementById('ledGreen').classList.remove('aniStart');
    return;
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
  document.getElementById('ledBlue').classList.add('aniStart');
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
    pokemon.length == poke.results.length ? document.getElementById('ledBlue').classList.remove('aniStart') : document.getElementById('ledBlue').classList.remove('aniStart');
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

function move(direction) {
  let poke = document.querySelectorAll('.pokeBar');
  if ((currentId == 0 && direction == '14.3%') || (currentId == pokemon.length - 1 && direction == '-14.3%')) {
    return;
  } else {
    for (let i = 0; i < poke.length; i++) {
      poke[i].style.translate = `0 ${direction}`;
      changeClass(direction, i);
    }
    direction == '-14.3%' ? currentId++ : currentId--;
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
  if (direction === '-14.3%' && bar >= 1) {
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

