import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { filter, interval, map, startWith, takeWhile } from 'rxjs';
import { Attack, GameSettings, GameState, Player, Round } from './models';

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
  settings: GameSettings;
  players: Player[];
  rounds: Round[];
  menuOpened: boolean;
  started: boolean;
  paused: boolean;
  finished: boolean;
}

@Injectable()
@State<AppStateModel>({
  name: 'app',
  defaults: {
    settings: {
      intervalMs: 5000,
      playerNames: []
    },
    players: [],
    rounds: [],
    menuOpened: true,
    started: false,
    paused: false,
    finished: false,
  },
})
export class AppState {

  @Selector()
  static menuOpened(state: AppStateModel) {
    return state.menuOpened;
  }

  @Selector()
  static gameState(state: AppStateModel): GameState {
    return {
      menuOpened: state.menuOpened,
      started: state.started,
      paused: state.paused,
      finished: state.finished,
    };
  }

  @Selector()
  static leaderboard(state: AppStateModel) {
    return [...state.players].sort((a, b) => b.hp - a.hp || (b.diedAtRound ?? 0) - (a.diedAtRound ?? 0));
  }

  @Selector()
  static rounds(state: AppStateModel) {
    return [...state.rounds].reverse();
  }

  @Action(SetGameSettings)
  setGameSettings(context: StateContext<AppStateModel>, { settings }: SetGameSettings) {
    context.patchState({ settings, menuOpened: false });
  }

  @Action(InitGame)
  init(context: StateContext<AppStateModel>) {
    const { settings } = context.getState();
    context.patchState({ players: settings.playerNames.map<Player>(name => ({ name, hp: 100, diedAtRound: null })) });
  }

  @Action(StartGame)
  startGame(context: StateContext<AppStateModel>) {
    const { settings } = context.getState();

    interval(settings.intervalMs)
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
    const { settings } = context.getState();

    context.patchState({
      finished: false,
      players: settings.playerNames.map<Player>(name => ({ name, hp: 100, diedAtRound: null })),
      rounds: []
    });
    context.dispatch(new StartGame());
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
