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

function pushType(typeInfo) {
  types.push({
    'id': typeInfo.id,
    'origin': typeInfo.name,
    'damage': typeInfo.damage_relations,
    'name': typeInfo.names[typeInfo.names.findLastIndex((element) => element.language.name == 'de')]?.name ?? 'Unbekannt',
    'img': `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/lets-go-pikachu-lets-go-eevee/${typeInfo.id}.png`
  });
}