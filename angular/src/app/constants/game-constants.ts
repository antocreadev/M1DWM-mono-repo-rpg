// Types de cases
import {EnemyType, ItemType, TileType} from '../types/game-types';

export const TILE_TYPES = {
  START: "start",
  ITEM: "item",
  ENEMY: "enemy",
  HEAL: "heal",
  TRAP: "trap",
  TELEPORT: "teleport",
  EMPTY: "empty",
} as const;

// Types d'objets à gagner
export const ITEM_TYPES = ["potion", "sword", "shield", "amulet", "scroll"] as const;

// Descriptions des cases
export const TILE_DESCRIPTIONS: Record<TileType, string> = {
  [TILE_TYPES.START]: "Case de départ et d'arrivée. Terminez le tour complet pour gagner !",
  [TILE_TYPES.ITEM]: "Case d'objet. Vous y trouverez un équipement qui pourra vous aider.",
  [TILE_TYPES.ENEMY]: "Case d'ennemi. Préparez-vous au combat !",
  [TILE_TYPES.HEAL]: "Case de soin. Vous récupérez des points de vie.",
  [TILE_TYPES.TRAP]: "Case piège. Attention aux dégâts !",
  [TILE_TYPES.TELEPORT]: "Case de téléportation. Vous serez transporté à un autre endroit du plateau.",
  [TILE_TYPES.EMPTY]: "Case vide. Il ne se passe rien ici.",
};

// Types d'ennemis
export const ENEMY_TYPES = ["goblin", "skeleton", "ghost", "dragon", "witch"] as const;

// Descriptions des ennemis
export interface EnemyDescription {
  name: string;
  description: string;
  weakness: 'physical' | 'magic';
}

export const ENEMY_DESCRIPTIONS: Record<EnemyType, EnemyDescription> = {
  goblin: {
    name: "Gobelin",
    description: "Un petit monstre vicieux qui attaque en groupe.",
    weakness: "physical",
  },
  skeleton: {
    name: "Squelette",
    description: "Un mort-vivant résistant aux attaques physiques.",
    weakness: "magic",
  },
  ghost: {
    name: "Fantôme",
    description: "Un esprit qui peut traverser les murs et est quasi-invulnérable aux attaques physiques.",
    weakness: "magic",
  },
  dragon: {
    name: "Dragon",
    description: "Une créature gigantesque, crachant du feu et très puissante.",
    weakness: "physical",
  },
  witch: {
    name: "Sorcière",
    description: "Une magicienne qui lance des sortilèges dangereux.",
    weakness: "physical",
  },
};

// Couleurs pour les différentes cases (Tailwind CSS)
export const TILE_COLORS: Record<TileType, string> = {
  [TILE_TYPES.START]: "bg-green-500",
  [TILE_TYPES.ITEM]: "bg-amber-400",
  [TILE_TYPES.ENEMY]: "bg-red-500",
  [TILE_TYPES.HEAL]: "bg-blue-400",
  [TILE_TYPES.TRAP]: "bg-purple-500",
  [TILE_TYPES.TELEPORT]: "bg-indigo-500",
  [TILE_TYPES.EMPTY]: "bg-gray-300",
};

// Types de personnages
export interface CharacterType {
  id: string;
  name: string;
  color: string;
  power: 'magic' | 'strength' | 'lifesteal';
  description: string;
  damage: number;
  baseDamage: number;
  lifeStealRatio?: number;
}

export const CHARACTER_TYPES: CharacterType[] = [
  {
    id: "magician",
    name: "Magicien",
    color: "blue",
    power: "magic",
    description: "Attaques magiques puissantes",
    damage: 20,
    baseDamage: 15,
  },
  {
    id: "warrior",
    name: "Guerrier",
    color: "red",
    power: "strength",
    description: "Force physique supérieure",
    damage: 25,
    baseDamage: 20,
  },
  {
    id: "vampire",
    name: "Vampire",
    color: "gray",
    power: "lifesteal",
    description: "Vol de vie",
    damage: 15,
    baseDamage: 12,
    lifeStealRatio: 0.3,
  },
];

// Définition des objets du jeu
export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  effect: {
    type: 'heal' | 'damage' | 'defense' | 'special';
    value: number;
    uses?: number;
    currentUses?: number;
  };
  usableInCombat: boolean;
  icon: string;
}

export const GAME_ITEMS: Record<string, GameItem> = {
  healingPotion: {
    id: "healingPotion",
    name: "Potion de soin",
    type: "potion",
    description: "Restaure 30 points de vie.",
    effect: {
      type: "heal",
      value: 30,
      uses: 1,
    },
    usableInCombat: true,
    icon: "❤️",
  },
  // ... (autres items conservés identiques)
};

// Fonction pour obtenir un objet aléatoire
export const getRandomItem = (): GameItem => {
  const items = Object.values(GAME_ITEMS);
  const randomIndex = Math.floor(Math.random() * items.length);
  const item = { ...items[randomIndex] };

  if (item.effect.uses) {
    item.effect.currentUses = item.effect.uses;
  }

  return item;
};
