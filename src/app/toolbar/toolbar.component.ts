import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { PauseGame, RestartGame, ResumeGame, StartGame } from '../app.state';
import { GameState } from '../models';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {

  @Input() gameState: GameState;

  constructor(private store: Store) { }

  start(): void {
    this.store.dispatch(new StartGame());
  }

  restart() {
    this.store.dispatch(new RestartGame());
  }

  pause(): void {
    this.store.dispatch(new PauseGame());
  }

  resume(): void {
    this.store.dispatch(new ResumeGame());
  }
}
