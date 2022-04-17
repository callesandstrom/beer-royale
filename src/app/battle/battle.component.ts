import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppState, FinishGame, InitGame, PauseGame, RestartGame, ResumeGame, StartGame } from '../app.state';
import { GameState, LeaderboardItem, Player, Round } from '../models';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BattleComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();
  private snackbarRef?: MatSnackBarRef<TextOnlySnackBar>;

  @Select(AppState.gameState) gameState$: Observable<GameState>;
  @Select(AppState.leaderboard) leaderboard$: Observable<LeaderboardItem[]>;
  @Select(AppState.rounds) rounds$: Observable<Round[]>;

  constructor(private store: Store, private actions$: Actions, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.store.dispatch(new InitGame());

    this.actions$
      .pipe(ofActionDispatched(StartGame), takeUntil(this.unsubscribe))
      .subscribe(() => this.snackbarRef?.dismiss());

    this.actions$
      .pipe(ofActionDispatched(FinishGame), takeUntil(this.unsubscribe))
      .subscribe(() => this.onFinish());
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.snackbarRef?.dismiss();
  }

  private onFinish(): void {
    this.snackbarRef = this.snackbar.open(this.getWinnerMessage());
  }

  private getWinnerMessage(): string {
    const winners = this.store.selectSnapshot(AppState.leaderboard).filter(x => x.position === 1);

    return winners.length === 1
      ? `Grattis ${winners[0].name}🥇 May you drink in peace 🍺`
      : `Flera vinnare! 🤯 Deathmatch mellan ${winners.map(x => x.name).join(' och ')}`;
  }
}
