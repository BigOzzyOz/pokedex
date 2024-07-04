function htmlRenderEvoPoke(pokeIndex = emptyPoke, step, index = 0) {
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

function htmlRenderEvo(step) {
  return /*html*/`
    <div id="${step}" class="evoStepContainer"></div>
  `;
}

function htmlDamageList(counterPoke) {
  return /*html*/`
        <li class="dmgImg ${counterPoke.origin}"></li>
      `;
}

function htmlDamageEmpty(x) {
  return /*html*/`
      ${x == 'start' ? '<ul>' : '</ul>'}
    `;
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

function htmlCreateCardPage(page) {
  document.getElementById('pagination').innerHTML += /*html*/`
    <a href="#cardView${page}" onclick="openCard(${page}, this)" ${page == 1 ? `id="defaultCard"` : ''}>${page}</a>
  `;
  document.getElementById('cardView').innerHTML += /*html*/`
    <div id="cardView${page}" class="cardView ${page == 1 ? '' : "d-none"}"></div>
  `;
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
    <div id="loaderContainer" class="loaderContainer"></div>
  `;
}

function htmlLoaderAdd() {
  return /*html*/`
    <div class="loader"></div>
  `;
}

function htmlAbort() {
  return /*html*/`
    <p>Schade, viel Spaß auf deiner Reise. Solltest du es dir anders Überlegen Starte das Gerät neu</p>
  `;
}