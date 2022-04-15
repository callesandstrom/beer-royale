import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppState, FinishGame, InitGame, PauseGame, RestartGame, ResumeGame, StartGame } from '../app.state';
import { GameState, Player, Round } from '../models';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();

  @Select(AppState.gameState) gameState$: Observable<GameState>;
  @Select(AppState.leaderboard) leaderboard$: Observable<Player[]>;
  @Select(AppState.rounds) rounds$: Observable<Round[]>;

  constructor(private store: Store, private actions$: Actions, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.store.dispatch(new InitGame());

    this.actions$
      .pipe(ofActionDispatched(FinishGame), takeUntil(this.unsubscribe))
      .subscribe(() => this.onFinish());
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private onFinish(): void {
    this.snackbar.open(this.getWinnerMessage());
  }

  private getWinnerMessage(): string {
    const leaderboard = this.store.selectSnapshot(AppState.leaderboard);
    const alivePlayer = leaderboard.find(x => x.hp > 0);

    if (alivePlayer) {
      return `Graaattiss ${alivePlayer.name} May you drink in peace 🥳🍻🎈`;
    }

    const rounds = this.store.selectSnapshot(AppState.rounds);
    const tiedPlayers = leaderboard.filter(x => x.diedAtRound === rounds[0].number);

    return `Ingen vinnare! 😬 Deathmatch mellan ${tiedPlayers.map(x => x.name).join(' och ')}`;
  }
}
