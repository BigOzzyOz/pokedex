let baseURL = 'https://pokeapi.co/api/v2/';
let paths, type, poke;
let currentId = 0;
const types = [];
const pokemon = [];

function renderPokemonBars(id = currentId) {
  let currentSet = [pokemon[id - 4], pokemon[id - 3], pokemon[id - 2], pokemon[id - 1], pokemon[id], pokemon[id + 1], pokemon[id + 2], pokemon[id + 3], pokemon[id + 4]];
  let bars = document.getElementById('barView');
  currentId = id;
  bars.innerHTML = '';

  for (let i = 0; i < currentSet.length; i++) {
    bars.innerHTML += htmlRenderBars(currentSet[i] == undefined ? 1 : currentSet[i]);
    changeClass(0, i);
  }
  pokemonBg('.pokeBar');
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

async function renderLoadingbar() {
  let loadBar = document.getElementById('loadProgress');
  let text = document.getElementById('loadProgressText');
  text.innerHTML = `${pokemon.length} von ${poke.count} Pokemon geladen`;
  loadBar.style.width = `${Number((pokemon.length / poke.count) * 100).toFixed(1)}%`;
}

async function getTypes(paths) {
  document.getElementById('ledYellow').classList.add('paused');
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
    document.getElementById('ledYellow').classList.remove('paused');
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
  document.getElementById('ledGreen').classList.add('paused');
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
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  } finally {
    clearInterval(id);
    document.getElementById('loadbar').classList.add('d-none');
    document.getElementById('ledGreen').classList.remove('paused');
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
    'imgSmall': info.sprites.other.showdown.front_default,
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


async function getData(path = baseURL) {
  document.getElementById('ledBlue').classList.add('paused');
  try {
    let response = await fetch(path);
    paths = await response.json();
    response = await fetch(paths.pokemon + '?limit=100000&offset=0');
    poke = await response.json();
    getTypes(paths);
    getPokemon(poke);
  } catch (error) { console.error('Fehler beim Abrufen der Daten:', error); } finally {

    await poke.count == pokemon.length ? document.getElementById('ledBlue').classList.remove('paused') : null;
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
  image.src = image.src.indexOf('table') != -1 ? 'assets/icons/bars-solid.svg' : 'assets/icons/table-cells-solid.svg';
}


function move(direction) {
  let poke = document.querySelectorAll('.pokeBar');
  if ((currentId == 0 && direction == '14.3%') || (currentId == pokemon.length && direction == '-14.3%')) {
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
      pokeBar.style.background = `linear-gradient(2deg, var(--${type1}) 60%, var(--${type2}) 75%)`;
    } else if (type1) {
      pokeBar.style.background = `var(--${type1})`;
    } else if (type2) {
      pokeBar.style.background = `var(--${type2})`;
    }
  });
}

function render() {
  let cont = document.getElementById('barView');
  cont.innerHTML = /*html*/`    
    <div class="pokeBar last3" data-type1="normal" data-type2="fighting">
      <div class="barStatus">
        <p class="PokeId">0001</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/1.png" alt="">
        <img src="assets/icons/2.png" alt="">
      </div>
    </div>
    <div class="pokeBar last2" data-type1="flying" data-type2="poison">
      <div class="barStatus">
        <p class="PokeId">0002</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/2.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/3.png" alt="">
        <img src="assets/icons/4.png" alt="">
      </div>
    </div>
    <div class="pokeBar last1" data-type1="ground" data-type2="rock">
      <div class="barStatus">
        <p class="PokeId">0003</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/3.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/5.png" alt="">
        <img src="assets/icons/6.png" alt="">
      </div>
    </div>
    <div class="pokeBar last" data-type1="bug" data-type2="ghost">
      <div class="barStatus">
        <p class="PokeId">0004</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/7.png" alt="">
        <img src="assets/icons/8.png" alt="">
      </div>
    </div>
    <div class="pokeBar current" data-type1="steel" data-type2="fire">
      <div class="barStatus">
        <p class="PokeId">0005</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/5.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/9.png" alt="">
        <img src="assets/icons/10.png" alt="">
      </div>
    </div>
    <div class="pokeBar next" data-type1="water" data-type2="grass">
      <div class="barStatus">
        <p class="PokeId">0006</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/11.png" alt="">
        <img src="assets/icons/12.png" alt="">
      </div>
    </div>
    <div class="pokeBar next1" data-type1="electric" data-type2="psychic">
      <div class="barStatus">
        <p class="PokeId">0007</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/13.png" alt="">
        <img src="assets/icons/14.png" alt="">
      </div>
    </div>
    <div class="pokeBar next2" data-type1="ice" data-type2="dragon">
      <div class="barStatus">
        <p class="PokeId">0008</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/8.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/15.png" alt="">
        <img src="assets/icons/16.png" alt="">
      </div>
    </div>
    <div class="pokeBar next3" data-type1="dark" data-type2="fairy">
      <div class="barStatus">
        <p class="PokeId">0009</p>
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/9.gif"
        alt="">
        <p class="pokeName">Name</p>
      </div>
      <div class="barType">
        <img src="assets/icons/17.png" alt="">
        <img src="assets/icons/18.png" alt="">
      </div>
    </div>
    `;
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

function openPage(id, element, color) {
  let tab = document.getElementsByClassName('topTab');
  let tabLink = document.getElementsByClassName('topTabLink');
  for (let i = 0; i < tabLink.length; i++) {
    tab[i].style.display = 'none';
    tabLink[i].style.backgroundColor = '';
  }
  document.getElementById(id).style.display = 'block';
  element.style.backgroundColor = color;
}

function renderTopScreen() {
  document.getElementById('defaultOpen').click();
}

