export interface ScoreEntry {
  id: number;
  username: string;
  score: number;
  characterType: string;
  health: number;
  itemsCollected: number;
  date: string;
  won: boolean;
}

export interface UserScores {
  [username: string]: ScoreEntry[];
}
