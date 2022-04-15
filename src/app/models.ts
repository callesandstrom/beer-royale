export interface GameSettings {
  playerNames: string[];
  intervalMs: number;
}

export interface Player {
  name: string;
  hp: number;
  diedAtRound: number | null;
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
  menuOpened: boolean;
  started: boolean;
  paused: boolean;
  finished: boolean;
}
