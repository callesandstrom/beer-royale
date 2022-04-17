import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { filter, interval, map, startWith, takeWhile } from 'rxjs';
import { calculateRound, getLeaderboard } from './battle/battle.utility';
import { AddHistory } from './history/history.state';
import { GameSettings, GameState, HistoryItem, LeaderboardItem, Player, Round } from './models';

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
    return getLeaderboard(state.players);
  }

  @Selector()
  static rounds(state: AppStateModel): Round[] {
    return [...state.rounds].reverse();
  }

  ngxsOnInit(context: StateContext<AppStateModel>) {
    const cachedSettings = localStorage.getItem('settings');
    const settings = cachedSettings ? JSON.parse(cachedSettings) : undefined;

    context.patchState({ settings });
  }

  @Action(SetGameSettings)
  setGameSettings(context: StateContext<AppStateModel>, { settings }: SetGameSettings) {
    localStorage.setItem('settings', JSON.stringify(settings));
    context.patchState({ settings });
  }

  @Action(InitGame)
  init(context: StateContext<AppStateModel>) {
    const { settings } = context.getState();
    const players = settings!.players.map<Player>(player => ({ name: `${player.name} ${player.emoji}`, hp: 100, diedAtRound: null }));

    context.setState({ ...initialState, settings, players });
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

    const { players } = context.getState();
    const historyItem: HistoryItem = {
      leaderboard: getLeaderboard(players),
      date: Date.now(),
      isSaved: false,
    };

    context.dispatch(new AddHistory(historyItem));
  }

  @Action(RestartGame)
  restartGame(context: StateContext<AppStateModel>) {
    context
      .dispatch(new InitGame())
      .subscribe(() => context.dispatch(new StartGame()));
  }

  @Action(CalculateRound)
  calculateRound(context: StateContext<AppStateModel>) {
    const state = context.getState();
    const { rounds, players } = calculateRound(state.rounds, state.players);

    context.patchState({ rounds, players });
  }
}
