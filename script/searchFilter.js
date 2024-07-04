function filterPokemon(types) {
  for (let i = 0; i < pokemon.length; i++) {
    const poke = pokemon[i];
    types.forEach(type => {
      poke.type1 == type || poke.type2 == type ? filteredPokemon.push(poke) : null;
    });
  }
  let firstPoke = filteredPokemon.length == 0 ? pokemon[currentId].name : filteredPokemon[0].name;
  searchId = pokemon.findIndex(element => element.name == firstPoke);
  currentId = searchId == -1 ? currentId : searchId;
  finishFilter();
}

function filterTypes() {
  let filterTypes = [];
  let filter = document.querySelectorAll('#typeFilters input[type=checkbox]:checked');
  filteredPokemon.splice(0, filteredPokemon.length);
  if (filter.length == 0 || filter.length == 18) {
    resetFilter();
  } else {
    filter.forEach(type => { filterTypes.push(type.value); });
    filterPokemon(filterTypes);
  }
}

function finishFilter() {
  renderPokemonCards();
  renderPokemonBars();
  closeMenu('filter');
}

function resetFilter() {
  let filter = document.querySelectorAll('#typeFilters input[type=checkbox]:checked');
  filter.forEach(element => {
    element.checked = false;
  });
  filteredPokemon.splice(0, filteredPokemon.length);
  filteredId = 0;
  currentId = 0;
  finishFilter();
}

function searchBarView(searchInput) {
  let searchId = pokemon.findIndex((pokemons) =>
    pokemons.name.toLowerCase().includes(searchInput) || String(pokemons.id).toLowerCase().padStart(4, '0').includes(searchInput)
  );
  currentId = searchId == -1 ? currentId : searchId;
  updateFilteredId();
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
  updateFilteredId();
  renderPokemonCards(pokeArray);
  renderTopScreen();
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

function updateFilteredId() {
  if (filteredPokemon.length == 0) {
    return;
  } else {
    let filter;
    if (pokemon[currentId].id > filteredPokemon[filteredId].id) {
      filter = filteredPokemon.findIndex(element => element.id >= pokemon[currentId].id);
    } else if (pokemon[currentId].id < filteredPokemon[filteredId].id) {
      filter = filteredPokemon.findLastIndex(element => element.id <= pokemon[currentId].id);
    } else {
      filter = filteredId;
    }
    filteredId = filter == - 1 ? filteredId : filter;
    currentId = pokemon.findIndex(element => element.id === filteredPokemon[filteredId].id);
  }
}