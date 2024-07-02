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
    } else {
      document.getElementById('loaderContainer').innerHTML += htmlLoaderAdd();
    };
  }, 2500);
  await waitDownload;
  finishDownload();
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