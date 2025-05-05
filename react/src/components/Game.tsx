import React, { useState, useEffect } from "react";
import CharacterSelection from "./character-selection";
import {GameBoard} from "./game-board";
import {CombatScreen} from "./combat-screen";
import {PlayerStatus} from "./player-status";
import {GameOver} from "./game-over";
import { useGameLogic } from "../hooks/use-game-logic";
import AuthContainer from "./auth/auth-container";
import CharacterManager from "./character/character-manager";
import GameSessionManager from "./game/game-session-manager";
import { apiService } from "../services/api-service";
import { Modal } from "./modal";

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

enum GameScreen {
  AUTH,
  MENU,
  CHARACTER_SELECTION,
  CHARACTER_MANAGER,
  GAME_SESSION,
  GAME_BOARD,
  COMBAT,
  GAME_OVER,
}

// Types pour le menu
interface MenuItem {
  label: string;
  action: () => void;
}

const Game = () => {
  // État d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // État du jeu
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(
    GameScreen.AUTH
  );
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [currentGameSession, setCurrentGameSession] =
    useState<GameSession | null>(null);

  // Menu principal
  const [showMainMenu, setShowMainMenu] = useState<boolean>(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = apiService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setCurrentScreen(GameScreen.MENU);
      }
    };

    checkAuth();
  }, []);

  // Utilisation du hook de logique de jeu
  const {
    character,
    setCharacter,
    gameState,
    setGameState,
    health,
    setHealth,
    board,
    updateBoard,
    playerPosition,
    setPlayerPosition,
    inventory,
    setInventory,
    message,
    setMessage,
    dice,
    diceResult,
    isRolling,
    enemy,
    setEnemy,
    isPlayerAttacking,
    isEnemyAttacking,
    handleRoll,
    handleMove,
    handleAttack,
    handleUseItem,
    resetGame,
  } = useGameLogic();

  // Initialiser une nouvelle partie
  const startNewGame = async () => {
    if (!selectedCharacter) return;

    setCharacter(selectedCharacter);
    setHealth(100);
    setInventory([]);
    setPlayerPosition(0);
    setMessage("Début de l'aventure !");
    setGameState("playing");

    // Créer une nouvelle session de jeu dans l'API
    try {
      const newSession = await apiService.createGameSession({
        character_id: selectedCharacter.id,
        player_position: 0,
        health: 100,
        inventory: [],
        message: "Début de l'aventure !",
        dice_result: null,
        is_rolling: false,
        game_state: "playing",
      });

      setCurrentGameSession(newSession);
      setCurrentScreen(GameScreen.GAME_BOARD);
    } catch (error) {
      console.error("Erreur lors de la création de la partie:", error);
      alert("Erreur lors de la création de la partie. Veuillez réessayer.");
    }
  };

  // Charger une partie existante
  const loadGame = async (session: GameSession) => {
    try {
      setCharacter(session.character);
      setHealth(session.health);
      setPlayerPosition(session.player_position);
      setInventory(session.inventory);
      setMessage(session.message);
      setGameState(session.game_state);
      setCurrentGameSession(session);

      // Charger les tuiles et l'ennemi
      const gameDetails = await apiService.getGameSession(session.id);
      if (gameDetails.tiles) {
        updateBoard(gameDetails.tiles);
      }
      if (gameDetails.enemy) {
        setEnemy(gameDetails.enemy);
      }

      // Rediriger vers le bon écran en fonction de l'état du jeu
      if (session.game_state === "combat") {
        setCurrentScreen(GameScreen.COMBAT);
      } else if (session.game_state === "gameOver") {
        setCurrentScreen(GameScreen.GAME_OVER);
      } else {
        setCurrentScreen(GameScreen.GAME_BOARD);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la partie:", error);
      alert("Erreur lors du chargement de la partie. Veuillez réessayer.");
    }
  };

  // Sauvegarder l'état du jeu
  const saveGameState = async () => {
    if (!currentGameSession || !character) return;

    try {
      await apiService.updateGameSession(currentGameSession.id, {
        character_id: character.id,
        player_position: playerPosition,
        health: health,
        inventory: inventory,
        message: message,
        dice_result: diceResult,
        is_rolling: isRolling,
        game_state: gameState,
      });

      if (board && board.length > 0) {
        await apiService.addTilesToGameSession(currentGameSession.id, board);
      }

      if (enemy) {
        await apiService.addEnemyToGameSession(currentGameSession.id, enemy);
      }

      alert("Partie sauvegardée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la partie:", error);
      alert("Erreur lors de la sauvegarde de la partie. Veuillez réessayer.");
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setCurrentScreen(GameScreen.AUTH);
    resetGame();
    setSelectedCharacter(null);
    setCurrentGameSession(null);
  };

  // Ouvrir le menu principal
  const openMainMenu = () => {
    setShowMainMenu(true);
  };

  // Fermer le menu principal
  const closeMainMenu = () => {
    setShowMainMenu(false);
  };

  // Éléments du menu principal
  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    // Élément toujours présent: retourner à la sélection des personnages
    items.push({
      label: "Sélection des personnages",
      action: () => {
        setCurrentScreen(GameScreen.CHARACTER_MANAGER);
        closeMainMenu();
      },
    });

    // Si on est en jeu, ajouter l'option de sauvegarde
    if (
      currentGameSession &&
      (currentScreen === GameScreen.GAME_BOARD ||
        currentScreen === GameScreen.COMBAT)
    ) {
      items.push({
        label: "Sauvegarder la partie",
        action: () => {
          saveGameState();
          closeMainMenu();
        },
      });
    }

    // Élément toujours présent: se déconnecter
    items.push({
      label: "Se déconnecter",
      action: () => {
        handleLogout();
        closeMainMenu();
      },
    });

    return items;
  };

  // Gérer l'authentification réussie
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen(GameScreen.MENU);
  };

  // Rendu en fonction de l'écran actuel
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case GameScreen.AUTH:
        return <AuthContainer onAuthSuccess={handleAuthSuccess} />;

      case GameScreen.MENU:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
              <h1 className="text-4xl font-bold text-white mb-8">
                RPG Board Game
              </h1>
              <div className="flex flex-col space-y-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg"
                  onClick={() => setCurrentScreen(GameScreen.CHARACTER_MANAGER)}
                >
                  Gérer mes personnages
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded text-lg"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        );

      case GameScreen.CHARACTER_MANAGER:
        return (
          <CharacterManager
            onSelectCharacter={(character) => {
              setSelectedCharacter(character);
              setCurrentScreen(GameScreen.GAME_SESSION);
            }}
            onBackToMenu={() => setCurrentScreen(GameScreen.MENU)}
          />
        );

      case GameScreen.GAME_SESSION:
        if (!selectedCharacter) return null;
        return (
          <GameSessionManager
            character={selectedCharacter}
            onStartNewGame={startNewGame}
            onLoadGame={loadGame}
            onBack={() => setCurrentScreen(GameScreen.CHARACTER_MANAGER)}
          />
        );

      case GameScreen.GAME_BOARD:
        return (
          <div className="min-h-screen flex flex-col bg-gray-800">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={openMainMenu}
              >
                Menu
              </button>
              <h1 className="text-2xl font-bold">RPG Board Game</h1>
              <PlayerStatus health={health} inventory={inventory} />
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <GameBoard board={board} character={character} />

              <div className="mt-6 text-white text-center max-w-2xl">
                <p className="mb-4 text-lg">{message}</p>
                <button
                  onClick={handleRoll}
                  disabled={isRolling || gameState !== "playing"}
                  className={`px-6 py-3 ${
                    isRolling || gameState !== "playing"
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg font-semibold transition-colors`}
                >
                  {isRolling ? "Lancer en cours..." : "Lancer le dé"}
                </button>
              </div>
            </div>
          </div>
        );

      case GameScreen.COMBAT:
        return (
          <div className="min-h-screen flex flex-col bg-gray-800">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={openMainMenu}
              >
                Menu
              </button>
              <h1 className="text-2xl font-bold">RPG Board Game - Combat</h1>
              <div></div>
            </div>

            <div className="flex-grow">
              <CombatScreen
                character={character}
                enemy={enemy}
                health={health}
                message={message}
                inventory={inventory}
                onAttack={handleAttack}
                onUseItem={handleUseItem}
                isPlayerAttacking={isPlayerAttacking}
                isEnemyAttacking={isEnemyAttacking}
              />
            </div>
          </div>
        );

      case GameScreen.GAME_OVER:
        return (
          <GameOver
            message={message}
            onRestart={() => {
              resetGame();
              setCurrentScreen(GameScreen.MENU);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderCurrentScreen()}

      <Modal
        isOpen={showMainMenu}
        onClose={closeMainMenu}
        title="Menu principal"
      >
        <div className="flex flex-col space-y-4 py-4">
          {getMenuItems().map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
            >
              {item.label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Game;
