import React, { useState } from "react";
import { apiService } from "../../services/api-service";

interface RegisterProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onLoginClick,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation côté client
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    console.log("Tentative d'inscription avec:", { username, email });

    try {
      const success = await apiService.register(username, email, password);
      console.log("Résultat de l'inscription:", success);

      if (success) {
        console.log("Inscription réussie, redirection vers la connexion");
        onRegisterSuccess();
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      setError(
        err.message || "Une erreur s'est produite lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Créer un compte</h1>

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

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <div className="mb-4">
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

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Inscription en cours..." : "S'inscrire"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Déjà un compte ?{" "}
          <button
            onClick={onLoginClick}
            className="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
