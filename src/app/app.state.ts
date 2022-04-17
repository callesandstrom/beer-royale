import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { filter, interval, map, startWith, takeWhile } from 'rxjs';
import { Attack, GameSettings, GameState, LeaderboardItem, Player, Round } from './models';
import { groupBy } from './utilities';

const weapons = ['Eldboll', 'Kokosnöt', 'Regnbågsvätska', 'Fiskben', 'Rent gift', 'Majskolv', 'Häxvrål', 'Batong', 'Späckhuggare', 'Pulver', 'Ett mapp', 'Örfil', 'Trollstav', 'Mossa', 'Smör', 'Sin röst'];

export class SetGameSettings {
  static readonly type = '[App] Set Game Settings';
  constructor(public settings: GameSettings) { }
}

export class InitGame {
  static readonly type = '[App] Init Game';
}

export class StartGame {
  static readonly type = '[App] Start Game';
}

export class PauseGame {
  static readonly type = '[App] Pause Game';
}

export class ResumeGame {
  static readonly type = '[App] Resume Game';
}

export class FinishGame {
  static readonly type = '[App] Finish Game';
}

export class RestartGame {
  static readonly type = '[App] Restart Game';
}

export class CalculateRound {
  static readonly type = '[App] Calculate Round';
}

export interface AppStateModel {
  settings?: GameSettings;
  players: Player[];
  rounds: Round[];
  started: boolean;
  paused: boolean;
  finished: boolean;
}

const initialState: AppStateModel = {
  settings: undefined,
  players: [],
  rounds: [],
  started: false,
  paused: false,
  finished: false,
};

@Injectable()
@State<AppStateModel>({
  name: 'app',
  defaults: initialState
})
export class AppState implements NgxsOnInit {

  @Selector()
  static settings(state: AppStateModel): GameSettings | undefined {
    return state.settings;
  }

  @Selector()
  static gameState(state: AppStateModel): GameState {
    return {
      started: state.started,
      paused: state.paused,
      finished: state.finished,
    };
  }

  @Selector()
  static leaderboard(state: AppStateModel): LeaderboardItem[] {
    const sortedPlayers = [...state.players].sort((a, b) => b.hp - a.hp || (b.diedAtRound ?? 0) - (a.diedAtRound ?? 0));
    const groups = groupBy(sortedPlayers, x => `${x.hp}-${x.diedAtRound ?? 0}`);
    return Object.keys(groups).reduce<LeaderboardItem[]>((acc, cur) => [...acc, ...groups[cur].map(x => ({ ...x, position: acc.length + 1 }))], []);
  }

  @Selector()
  static rounds(state: AppStateModel): Round[] {
    return [...state.rounds].reverse();
  }

  ngxsOnInit(context: StateContext<AppStateModel>) {
    const cachedSettings = localStorage.getItem('settings');

    if (cachedSettings) {
      context.patchState({ settings: JSON.parse(cachedSettings) });
    }
  }

  @Action(SetGameSettings)
  setGameSettings(context: StateContext<AppStateModel>, { settings }: SetGameSettings) {
    localStorage.setItem('settings', JSON.stringify(settings));
    context.patchState({ settings });
  }

  @Action(InitGame)
  init(context: StateContext<AppStateModel>) {
    const { settings } = context.getState();

    context.patchState({
      ...initialState,
      settings,
      players: settings!.players.map<Player>(player => ({ name: `${player.name} ${player.emoji}`, hp: 100, diedAtRound: null })),
    });
  }

  @Action(StartGame)
  startGame(context: StateContext<AppStateModel>) {
    const { settings } = context.getState();

    interval(settings!.intervalMs)
      .pipe(
        startWith(0),
        map(() => context.getState()),
        filter(state => !state.paused),
        takeWhile(state => state.players.filter(x => x.hp > 0).length > 1)
      )
      .subscribe({
        next: () => context.dispatch(new CalculateRound()),
        complete: () => context.dispatch(new FinishGame())
      });

    context.patchState({ started: true });
  }

  @Action(PauseGame)
  pauseGame(context: StateContext<AppStateModel>) {
    context.patchState({ paused: true });
  }

  @Action(ResumeGame)
  resumeGame(context: StateContext<AppStateModel>) {
    context.patchState({ paused: false });
  }

  @Action(FinishGame)
  finishGame(context: StateContext<AppStateModel>) {
    context.patchState({ finished: true });
  }

  @Action(RestartGame)
  restartGame(context: StateContext<AppStateModel>) {
    context
      .dispatch(new InitGame())
      .subscribe(() => context.dispatch(new StartGame()));
  }

  @Action(CalculateRound)
  calculateRound(context: StateContext<AppStateModel>) {
    const { rounds, players } = context.getState();
    const roundNumber = rounds.length + 1;
    const attacks: Attack[] = [];

    let updatedPlayers = [...players];

    players.filter(x => x.hp > 0).forEach(player => {
      const enemies = updatedPlayers.filter(x => x.hp > 0).filter(x => x.name !== player.name);
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];

      if (!enemy) {
        attacks.push({ playerName: player.name, enemyName: '', newEnemyHp: 0, weapon: '', damage: 0, isCriticalHit: false, isDeathblow: false });
        return;
      }

      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      const damage = Math.floor(Math.random() * 10) + 1;
      const isCriticalHit = Math.random() * 100 > 95;
      const finalDamage = isCriticalHit ? damage * 3 : damage;
      const newEnemyHp = Math.max(0, enemy.hp - finalDamage);
      const isDeathblow = newEnemyHp === 0;

      updatedPlayers = [
        ...updatedPlayers.filter(x => x.name !== enemy.name),
        { ...enemy, ...{ hp: newEnemyHp, diedAtRound: isDeathblow ? roundNumber : null } }
      ];

      attacks.push({ playerName: player.name, enemyName: enemy.name, newEnemyHp, weapon, damage: finalDamage, isCriticalHit, isDeathblow });
    });

    context.patchState({
      rounds: [...rounds, { number: roundNumber, attacks }],
      players: updatedPlayers
    });
  }
}
