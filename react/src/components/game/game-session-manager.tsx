import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api-service";

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

interface GameSession {
  id: number;
  character: Character;
  player_position: number;
  health: number;
  inventory: any[];
  message: string;
  game_state: string;
}

interface GameSessionManagerProps {
  character: Character;
  onStartNewGame: () => void;
  onLoadGame: (gameSession: GameSession) => void;
  onBack: () => void;
}

const GameSessionManager: React.FC<GameSessionManagerProps> = ({
  character,
  onStartNewGame,
  onLoadGame,
  onBack,
}) => {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGameSessions();
  }, []);

  const loadGameSessions = async () => {
    setLoading(true);
    setError("");

    try {
      const sessions = await apiService.getGameSessions();
      // Filtrer les sessions pour ne garder que celles avec le personnage actuel
      const characterSessions = sessions.filter(
        (session) => session.character.id === character.id
      );
      setGameSessions(characterSessions);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des parties sauvegardées"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette partie sauvegardée ?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.deleteGameSession(sessionId);
      setGameSessions(
        gameSessions.filter((session) => session.id !== sessionId)
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de la partie");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getGameStateLabel = (state: string) => {
    switch (state) {
      case "playing":
        return "En jeu";
      case "combat":
        return "En combat";
      case "gameOver":
        return "Partie terminée";
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Parties sauvegardées pour {character.name}
          </h1>
          <div>
            <button
              onClick={onStartNewGame}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-2"
            >
              Nouvelle partie
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Retour
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : gameSessions.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <p className="text-white text-lg">
              Aucune partie sauvegardée pour ce personnage.
            </p>
            <p className="text-gray-400 mt-2">
              Démarrez une nouvelle aventure !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {gameSessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {session.character.name} - Niveau{" "}
                      {Math.floor(session.health / 10)}
                    </h3>
                    <div className="text-sm text-gray-300 mt-1">
                      <div>État: {getGameStateLabel(session.game_state)}</div>
                      <div>Santé: {session.health}/100</div>
                      <div>Objets: {session.inventory.length}</div>
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => onLoadGame(session)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                    >
                      Charger
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSessionManager;
