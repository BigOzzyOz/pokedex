let baseURL = 'https://pokeapi.co/api/v2/';
let paths, type, poke, evolution;
let currentId = 0;
const types = [];
const evolutionChain = [];
const pokemon = [];

function setlocal(key, array) {
  localStorage.setItem(key, JSON.stringify(array));
}

async function getLocal(key) {
  let item = localStorage.getItem(key);
  item = await JSON.parse(item);
  return item;
}

async function getAndPushStorage(category, targetArray) {
  const loadItem = await getLocal(category);
  loadItem.forEach(element => targetArray.push(element));
}

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
  let screen = document.querySelectorAll('#topScreenInfo, #smallScreenInfo, #loadbar');
  let topScreenInfo = document.getElementById('topScreenInfo');
  topScreenInfo.innerHTML = htmlContinue();
  let waitDownload = getData();
  let intervalId = setInterval(() => {
    if (pokemon.length >= 20) {
      clearInterval(intervalId);
      renderPokemonBars();
      screen.forEach(element => { element.classList.toggle('d-none'); });
      document.getElementById('defaultTab').click();
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

function htmlCreateCardPage(page) {
  document.getElementById('pagination').innerHTML += /*html*/`
    <a href="#cardView${page}" onclick="openCard(${page}, this)" ${page == 1 ? `id="defaultCard"` : ''}>${page}</a>
  `;
  document.getElementById('cardView').innerHTML += /*html*/`
    <div id="cardView${page}" class="cardView ${page == 1 ? '' : "d-none"}"></div>
  `;
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

function htmlRenderBars(pokeIndex = pokemon[currentId]) {
  if (pokeIndex == 'hidden') {
    return /*html*/`
      <div class="pokeBar noPointer"></div>
    `;
  } else {
    return /*html*/`
    <div class="pokeBar" onclick="changePoke(${pokeIndex.id})" data-type1=${pokeIndex.type1} ${pokeIndex.type2 !== '' ? `data-type2=${pokeIndex.type2}` : ''}>
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
    <div id="pokemon${pokeId}" class="pokeCard" onclick="changePoke(${pokeArray[pokeId].id})" data-type1=${pokeArray[pokeId].type1} ${pokeArray[pokeId].type2 !== '' ? `data-type2=${pokeArray[pokeId].type2}` : ''}>
      <div class="cardStatus">
        <p class="PokeId">${String(pokeArray[pokeId].id).padStart(4, '0')}</p>
        <img src="${pokeArray[pokeId].imgSmall}" alt="image of ${pokeArray[pokeId].origin}">
        <p class="pokeName">${pokeArray[pokeId].name}</p>
      </div>
      <div class="cardType">
      <img loading="lazy"
        src="${types[types.findIndex((element) => element.origin === pokeArray[pokeId].type1)].img}" alt="${pokeArray[pokeId].type1}TypeImage">
        ${pokeArray[pokeId].type2 !== '' ? `<img loading="lazy" src="${types[types.findIndex((element) => element.origin === pokeArray[pokeId].type2)].img}" alt="${pokeArray[pokeId].type1}TypeImage">` : ''}
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
    'damage': typeInfo.damage_relations,
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
    'evolution': chain.id,
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

async function getEvolution(paths) {
  document.getElementById('ledYellow').classList.add('aniStart');
  try {
    response = await fetch("https://pokeapi.co/api/v2/evolution-chain/?offset=0&limit=20000");
    evolution = await response.json();
    for (let i = 0; i < evolution.results.length; i++) {
      response = await fetch(evolution.results[i].url);
      evoInfo = await response.json();
      pushEvolution(evoInfo, i);
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    document.getElementById('ledYellow').classList.remove('aniStart');
  }
}

function pushEvolution(evo, evoChainIndex) {
  let firstEvolution = [];
  let secondEvolution = [];
  evolutionChain.push({
    'id': evo.id,
    'basePoke': evo.chain.species.name,
    'firstEvolution': [],
    'secondEvolution': [],
  });
  firstEvo(evo, evoChainIndex);
}

function firstEvo(evo, evoChainIndex) {
  let firstEvolution = [];
  let secondEvolution;
  if (evo.chain.evolves_to.length > 0) {
    for (let i = 0; i < evo.chain.evolves_to.length; i++) {
      firstEvolution.push({
        'name': evo.chain.evolves_to[i].species.name,
        'trigger': evo.chain.evolves_to[i].evolution_details.length > 0 ? evo.chain.evolves_to[i].evolution_details[0].trigger.name : null,
        'level': evo.chain.evolves_to[i].evolution_details.length > 0 ? evo.chain.evolves_to[i].evolution_details[0].trigger.name !== 'level-up' ? null : evo.chain.evolves_to[i].evolution_details[0].min_level : null,
      });
      second = secondEvo(evo, i);
      secondEvolution = second;
    }
  }
  evolutionChain[evoChainIndex].firstEvolution = firstEvolution;
  evolutionChain[evoChainIndex].secondEvolution = secondEvolution;
}

function secondEvo(evo, firstIndex) {
  let secondEvolution = [];
  if (evo.chain.evolves_to[firstIndex].evolves_to.length > 0) {
    for (let j = 0; j < evo.chain.evolves_to[firstIndex].evolves_to.length; j++) {
      secondEvolution.push({
        'name': evo.chain.evolves_to[firstIndex].evolves_to[j].species.name,
        'trigger': evo.chain.evolves_to[firstIndex].evolves_to[j].evolution_details.length > 0 ? evo.chain.evolves_to[firstIndex].evolves_to[j].evolution_details[0].trigger.name : null,
        'level': evo.chain.evolves_to[firstIndex].evolves_to[j].evolution_details.length > 0 ? evo.chain.evolves_to[firstIndex].evolves_to[j].evolution_details[0].trigger.name !== 'level-up' ? null : evo.chain.evolves_to[firstIndex].evolves_to[j].evolution_details[0].min_level : null,
      });
    }
    return secondEvolution;
  }
}


async function getData(path = baseURL) {
  document.getElementById('ledBlue').classList.toggle('aniStart');
  try {
    let response = await fetch(path);
    paths = await response.json();
    response = await fetch(paths.pokemon + '?limit=100000&offset=0');
    poke = await response.json();
    await popPoke();
    await getTypes(paths);
    getEvolution(paths);
    await getPokemon(poke);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    document.getElementById('ledBlue').classList.toggle('aniStart');
  }
}

async function popPoke() {
  for (let i = poke.results.length; i = poke.results.length; i--) {
    let noPoke = poke.results.find((ele) => parseInt(ele.url.replace('\https://pokeapi.co/api/v2/pokemon/', ''), 10) >= 10000);
    if (!noPoke) {
      return;
    } else {
      poke.results.pop();
      poke.count = poke.results.length;
    }
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

function htmlrenderMisc(pokemonId) {
  return /*html*/`
    <img src="${pokemon[pokemonId].imgBig}" alt="image of ${pokemon[pokemonId].origin}">
    <div>
      <table>
        <tbody>
          <tr>
            <td>Name</td>
            <td>${pokemon[pokemonId].name}</td>
          </tr>
          <tr>
            <td>Größe</td>
            <td>${Number(pokemon[pokemonId].height / 10).toFixed(1)} Meter</td>
          </tr>
          <tr>
            <td>Gewicht</td>
            <td>${Number(pokemon[pokemonId].height / 10).toFixed(1)} Kilogramm</td>
          </tr>
          <tr>
            <td>Art</td>
            <td>${pokemon[pokemonId].genus}</td>
          </tr>
          <tr>
            <td>Info</td>
            <td>${pokemon[pokemonId].flavorText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function htmlrenderStats(pokemonId) {
  return /*html*/`
    <div class="statOverview">
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statHp" style="width: ${Number(pokemon[pokemonId].stats.hp / 255 * 100).toFixed()}%;"></div>
        </div>
        <div>
          <p>HP</p>
          <p>${pokemon[pokemonId].stats.hp}</p>
        </div>
      </div>
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statAttack" style="width: ${Number(pokemon[pokemonId].stats.attack / 255 * 100).toFixed()}%;"></div>
        </div>
        <div>
	        <p>Angriff</p>
          <p>${pokemon[pokemonId].stats.attack}</p>
        </div>
      </div>
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statDefense" style="width: ${Number(pokemon[pokemonId].stats.defense / 255 * 100).toFixed()}%;"></div>
        </div>
        <div>
	        <p>Verteidigung</p>
          <p>${pokemon[pokemonId].stats.defense}</p>
        </div>
      </div>
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statSpAttack" style="width: ${Number(pokemon[pokemonId].stats.spAttack / 255 * 100).toFixed()}%;"></div>
        </div>        
        <div>
	        <p>Spezial Angriff</p>
          <p>${pokemon[pokemonId].stats.spAttack}</p>
        </div>
      </div>
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statSpDefense" style="width: ${Number(pokemon[pokemonId].stats.spDefense / 255 * 100).toFixed()}%;"></div>
        </div>
        <div>
	        <p>Spezial Verteidigung</p>
          <p>${pokemon[pokemonId].stats.spDefense}</p>
        </div>
      </div>
      <div class="statsCont">
        <div class="statContainer">
          <div class="statBar statSpeed" style="width: ${Number(pokemon[pokemonId].stats.speed / 255 * 100).toFixed()}%;"></div>
        </div>
        <div>
	        <p>Geschwindigeit</p>
          <p>${pokemon[pokemonId].stats.speed}</p>
        </div>
      </div>
    </div>
    <div class="damageOverview">
      <div class="damageTypes">
        <img src="${types[types.findIndex((element) => element.origin === pokemon[pokemonId].type1)].img}" alt="${pokemon[pokemonId].type1}TypeImage">
        <div class="damageMulti">
          <ul>
            <li>Doppelter Schaden gegen</li>
            ${renderDamage(pokemonId, 'double_damage_to', 'type1')}
            <li>Halber Schaden von</li>
            ${renderDamage(pokemonId, 'half_damage_from', 'type1')}
            <li>Keinen Schaden von</li>
            ${renderDamage(pokemonId, 'no_damage_from', 'type1')}
          </ul>
        </div>
        <div class="damageMulti">
          <ul>
            <li>Doppelter Schaden von</li>
            ${renderDamage(pokemonId, 'double_damage_from', 'type1')}
            <li>Halber Schaden gegen</li>
            ${renderDamage(pokemonId, 'half_damage_to', 'type1')}
            <li>Keinen Schaden gegen</li>
            ${renderDamage(pokemonId, 'no_damage_to', 'type1')}
          </ul>
        </div>
      </div>
      ${pokemon[pokemonId].type2 === '' ? '' : /*html*/`
      <div class="damageTypes">
        <img src="${types[types.findIndex((element) => element.origin === pokemon[pokemonId].type2)].img}" alt="${pokemon[pokemonId].type2}TypeImage">
        <div class="damageMulti">
          <ul>
            <li>Doppelter Schaden gegen</li>
            ${renderDamage(pokemonId, 'double_damage_to', 'type2')}
            <li>Halber Schaden von</li>
            ${renderDamage(pokemonId, 'half_damage_from', 'type2')}
            <li>Keinen Schaden von</li>
            ${renderDamage(pokemonId, 'no_damage_from', 'type2')}
          </ul>
        </div>
        <div class="damageMulti">
          <ul>
            <li>Doppelter Schaden von</li>
            ${renderDamage(pokemonId, 'double_damage_from', 'type2')}
            <li>Halber Schaden gegen</li>
            ${renderDamage(pokemonId, 'half_damage_to', 'type2')}
            <li>Keinen Schaden gegen</li>
            ${renderDamage(pokemonId, 'no_damage_to', 'type2')}
          </ul>
        </div>
      </div>
      ` }
    </div>
  `;
}

function renderDamage(pokemonId = currentId, damageMulti, x) {
  let poke = x == 'type1' ? types[types.findIndex((element) => element.origin === pokemon[pokemonId].type1)] : types[types.findIndex((element) => element.origin === pokemon[pokemonId].type2)];
  let countertype = [];
  if (poke == undefined) {
    return;
  } else if (poke.damage[damageMulti].length == 0) {
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

function htmlDamageEmpty(x) {
  return /*html*/`
      ${x == 'start' ? '<ul>' : '</ul>'}
    `;
}

function htmlDamageList(counterPoke) {
  return /*html*/`
        <li><img src="${counterPoke.img}" alt="${counterPoke.origin}TypeImage"></li>
      `;
}

function renderEvo(pokemonId = currentId) {
  let evoChainId = evolutionChain.findIndex(ele => pokemon[pokemonId].evolution == ele.id);
  let evoContainer = document.getElementById('evo');
  let base, firstEvo, secondEvo;
  evoContainer.innerHTML = '';
  evoContainer.innerHTML += htmlRenderEvo('base');
  base = document.getElementById('base');
  renderBasePoke(evoChainId, 'base', base);
  if (evolutionChain[evoChainId].firstEvolution != undefined && evolutionChain[evoChainId].firstEvolution.length != 0) {
    evoContainer.innerHTML += htmlRenderEvo('firstEvolution');
    firstEvo = document.getElementById('firstEvolution');
    renderEvolutionPoke(evoChainId, 'firstEvolution', firstEvo);
  } if (evolutionChain[evoChainId].secondEvolution != undefined) {
    evoContainer.innerHTML += htmlRenderEvo('secondEvolution');
    secondEvo = document.getElementById('secondEvolution');
    renderEvolutionPoke(evoChainId, 'secondEvolution', secondEvo);
  }
}

// function renderEvoContainer(step,) {
//   evoContainer.innerHTML += htmlRenderEvo('base');
//    = document.getElementById('base');
//   renderBasePoke(evoChainId, 'base', base);
// }

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

function htmlRenderEvo(step) {
  return /*html*/`
    <div id="${step}" class="evoStepContainer"></div>
  `;
}

function htmlRenderEvoPoke(pokeIndex, step, index = 0) {
  return /*html*/`
    <div id="${step + index}" class="evoStepPokemon">
      <img src="${pokeIndex.imgBig}" alt="imageOf${pokeIndex.origin}">
      <p>${pokeIndex.name}</p>
      <p>${String(pokeIndex.id).padStart(4, '0')}</p>
      ${(step != 'firstEvolution') && (step != 'secondEvolution') ?
      '' :
      (evolutionChain[evolutionChain.findIndex(ele => pokeIndex.evolution == ele.id)][step][index].trigger == 'level-up') && (evolutionChain[evolutionChain.findIndex(ele => pokeIndex.evolution == ele.id)][step][index].level != null) ?
        /*html*/`<p>ab Level ${evolutionChain[evolutionChain.findIndex(ele => pokeIndex.evolution == ele.id)][step][index].level}</p>` :
        ''}
    </div>
  `;
}
