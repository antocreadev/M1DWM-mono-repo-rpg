import React, { useState } from "react";
import { apiService } from "../../services/api-service";

interface LoginProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onRegisterClick,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await apiService.login(username, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Connexion</h1>

      {error && (
        <div className="w-full bg-red-600 text-white p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-3 rounded font-medium ${
            isLoading
              ? "bg-blue-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition`}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Pas encore de compte ?{" "}
          <button
            onClick={(e) => {
              console.log("Bouton 'Créer un compte' cliqué");
              onRegisterClick();
            }}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
