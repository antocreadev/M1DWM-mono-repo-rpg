import React, { useState } from "react";

interface CharacterFormData {
  name: string;
  type: string;
  color: string;
  power: "magic" | "strength" | "lifesteal";
  base_damage: number;
}

interface CharacterCreationProps {
  onCreateCharacter: (character: CharacterFormData) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCreateCharacter,
}) => {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    type: "warrior",
    color: "blue",
    power: "strength",
    base_damage: 10,
  });

  const characterTypes = [
    { id: "warrior", name: "Guerrier", baseDamage: 12, defaultColor: "red" },
    { id: "mage", name: "Mage", baseDamage: 8, defaultColor: "blue" },
    { id: "rogue", name: "Voleur", baseDamage: 10, defaultColor: "green" },
    { id: "cleric", name: "Clerc", baseDamage: 9, defaultColor: "yellow" },
    { id: "archer", name: "Archer", baseDamage: 11, defaultColor: "purple" },
  ];

  const powerTypes = [
    {
      id: "strength",
      name: "Force",
      description: "Augmente les dégâts physiques",
    },
    { id: "magic", name: "Magie", description: "Augmente les dégâts magiques" },
    {
      id: "lifesteal",
      name: "Vol de vie",
      description: "Récupère des PV en attaquant",
    },
  ];

  const colorOptions = [
    { id: "red", name: "Rouge" },
    { id: "blue", name: "Bleu" },
    { id: "green", name: "Vert" },
    { id: "purple", name: "Violet" },
    { id: "orange", name: "Orange" },
    { id: "yellow", name: "Jaune" },
    { id: "teal", name: "Turquoise" },
    { id: "pink", name: "Rose" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      const selectedType = characterTypes.find((type) => type.id === value);
      setFormData({
        ...formData,
        [name]: value,
        base_damage: selectedType ? selectedType.baseDamage : 10,
        color: selectedType ? selectedType.defaultColor : formData.color,
      });
    } else if (name === "power") {
      setFormData({
        ...formData,
        [name]: value as "magic" | "strength" | "lifesteal",
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "base_damage" ? Number(value) : value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCharacter(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <div className="mb-4">
        <label htmlFor="name" className="block font-medium mb-1">
          Nom du personnage
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
          minLength={3}
          maxLength={20}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="type" className="block font-medium mb-1">
          Type de personnage
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          {characterTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} (Dégâts de base: {type.baseDamage})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="color" className="block font-medium mb-1">
          Couleur
        </label>
        <select
          id="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          {colorOptions.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
        <div
          className="mt-2 w-10 h-10 rounded-full border border-gray-600"
          style={{ backgroundColor: formData.color }}
        ></div>
      </div>

      <div className="mb-4">
        <label htmlFor="power" className="block font-medium mb-1">
          Pouvoir spécial
        </label>
        <select
          id="power"
          name="power"
          value={formData.power}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          {powerTypes.map((power) => (
            <option key={power.id} value={power.id}>
              {power.name} - {power.description}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="base_damage" className="block font-medium mb-1">
          Dégâts de base
        </label>
        <input
          type="number"
          id="base_damage"
          name="base_damage"
          value={formData.base_damage}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
          min={5}
          max={15}
        />
      </div>

      <button
        type="submit"
        className="w-full p-3 rounded font-medium bg-green-600 hover:bg-green-700 transition text-white"
      >
        Créer le personnage
      </button>
    </form>
  );
};

export default CharacterCreation;
