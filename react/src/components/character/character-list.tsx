import React from "react";

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

interface CharacterListProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  onDelete: (characterId: number) => void;
  loading: boolean;
}

const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  onSelect,
  onDelete,
  loading,
}) => {
  const getPowerLabel = (power: string): string => {
    switch (power) {
      case "magic":
        return "Magie";
      case "strength":
        return "Force";
      case "lifesteal":
        return "Vol de vie";
      default:
        return power;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-6 text-center">
        <p className="text-white text-lg">
          Vous n'avez pas encore créé de personnage.
        </p>
        <p className="text-gray-400 mt-2">
          Créez votre premier personnage pour commencer l'aventure !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <div
          key={character.id}
          className="bg-gray-700 rounded-lg p-4 flex flex-col hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-center mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: character.color }}
            >
              {character.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">{character.name}</h3>
              <p className="text-gray-300 capitalize">{character.type}</p>
            </div>
          </div>

          <div className="text-sm text-gray-300 mb-4 flex-grow">
            <div className="flex justify-between mb-1">
              <span>Pouvoir:</span>
              <span className="font-medium">
                {getPowerLabel(character.power)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dégâts de base:</span>
              <span className="font-medium">{character.base_damage}</span>
            </div>
          </div>

          <div className="flex justify-between mt-auto">
            <button
              onClick={() => onSelect(character)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
            >
              Sélectionner
            </button>
            <button
              onClick={() => onDelete(character.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;
