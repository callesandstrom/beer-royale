export interface GameSettings {
  players: { name: string; emoji: string; }[];
  intervalMs: number;
}

export interface Player {
  name: string;
  hp: number;
  diedAtRound: number | null;
}

export interface LeaderboardItem extends Player {
  position: number;
}

export interface Round {
  number: number;
  attacks: Attack[];
}

export interface Attack {
  playerName: string;
  enemyName: string;
  newEnemyHp: number;
  weapon: string;
  damage: number;
  isCriticalHit: boolean;
  isDeathblow: boolean;
}

export interface GameState {
  started: boolean;
  paused: boolean;
  finished: boolean;
}

export interface HistoryItem {
  date: number;
  leaderboard: LeaderboardItem[];
  isSaved: boolean;
}
