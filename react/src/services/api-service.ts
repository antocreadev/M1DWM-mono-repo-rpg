import { Character, GameSession } from "../types/game-types";

const API_URL = "http://localhost:8000";

// Fonction utilitaire pour gérer les erreurs
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Si la réponse est un JSON, on extrait le message d'erreur
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Erreur: ${response.status}`);
    } catch (e) {
      // Si la réponse n'est pas un JSON valide
      throw new Error(`Erreur: ${response.status}`);
    }
  }

  // Vérifie si la réponse est vide
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// Fonction pour récupérer le token stocké
const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Fonction pour configurer les headers avec le token d'authentification
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const apiService = {
  // Authentification
  async login(username: string, password: string): Promise<boolean> {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await handleResponse(response);
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  },

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      console.log("Début de l'inscription avec:", { username, email });

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      console.log("Réponse du serveur:", response.status, response.statusText);

      // Vérifier si la réponse est OK avant de retourner true
      if (response.ok) {
        const result = await handleResponse(response);
        console.log("Inscription réussie:", result);
        return true;
      } else {
        // Extraire le message d'erreur de la réponse
        const errorData = await response
          .json()
          .catch((e) => ({ detail: "Erreur de parsing JSON" }));
        console.error("Détails de l'erreur:", errorData);
        throw new Error(
          errorData.detail || `Erreur d'inscription: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Erreur détaillée lors de l'enregistrement:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
  },

  async checkAuth(): Promise<boolean> {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      localStorage.removeItem("auth_token");
      return false;
    }
  },

  // Gestion des personnages
  async getCharacters(): Promise<Character[]> {
    try {
      const response = await fetch(`${API_URL}/characters/`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des personnages:", error);
      throw error;
    }
  },

  async createCharacter(
    characterData: Omit<Character, "id">
  ): Promise<Character> {
    try {
      const response = await fetch(`${API_URL}/characters/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(characterData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erreur lors de la création du personnage:", error);
      throw error;
    }
  },

  async deleteCharacter(characterId: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/characters/${characterId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
    } catch (error) {
      console.error("Erreur lors de la suppression du personnage:", error);
      throw error;
    }
  },

  // Gestion des sessions de jeu
  async getGameSessions(): Promise<GameSession[]> {
    try {
      const response = await fetch(`${API_URL}/game-sessions/`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des sessions de jeu:",
        error
      );
      throw error;
    }
  },

  async createGameSession(sessionData: any): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/game-sessions/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Erreur lors de la création de la session de jeu:", error);
      throw error;
    }
  },

  async updateGameSession(
    sessionId: number,
    sessionData: Partial<GameSession>
  ): Promise<GameSession> {
    try {
      const response = await fetch(`${API_URL}/game-sessions/${sessionId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la session de jeu:",
        error
      );
      throw error;
    }
  },

  async deleteGameSession(sessionId: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/game-sessions/${sessionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la session de jeu:",
        error
      );
      throw error;
    }
  },
};

export default apiService;
