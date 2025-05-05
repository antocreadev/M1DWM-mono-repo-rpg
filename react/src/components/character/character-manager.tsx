import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api-service";
import CharacterCreation from "./character-creation";
import CharacterList from "./character-list";

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: "magic" | "strength" | "lifesteal";
  base_damage: number;
}

interface CharacterManagerProps {
  onSelectCharacter: (character: Character) => void;
  onBackToMenu: () => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  onSelectCharacter,
  onBackToMenu,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreation, setShowCreation] = useState(false);

  // Charger les personnages au chargement du composant
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setLoading(true);
    setError("");

    try {
      const fetchedCharacters = await apiService.getCharacters();
      setCharacters(fetchedCharacters);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des personnages");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = async (newCharacter: Omit<Character, "id">) => {
    setLoading(true);
    setError("");

    try {
      const createdCharacter = await apiService.createCharacter(newCharacter);
      setCharacters([...characters, createdCharacter]);
      setShowCreation(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du personnage");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce personnage ?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.deleteCharacter(characterId);
      setCharacters(characters.filter((c) => c.id !== characterId));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression du personnage");
    } finally {
      setLoading(false);
    }
  };

  const toggleCreationMode = () => {
    setShowCreation(!showCreation);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            {showCreation ? "Créer un personnage" : "Mes personnages"}
          </h1>
          <div>
            <button
              onClick={toggleCreationMode}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
            >
              {showCreation ? "Retour aux personnages" : "Nouveau personnage"}
            </button>
            <button
              onClick={onBackToMenu}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Retour au menu
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}

        {showCreation ? (
          <CharacterCreation onCreateCharacter={handleCreateCharacter} />
        ) : (
          <CharacterList
            characters={characters}
            onSelect={onSelectCharacter}
            onDelete={handleDeleteCharacter}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CharacterManager;
