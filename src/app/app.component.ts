import { Component } from '@angular/core';
import { GameSettings } from './game-setup/game-setup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  showGame = false;
  playerNames: string[] = [];
  intervalMs: number = 1000;

  onGameSetup(settings: GameSettings): void {
    this.showGame = true;
    this.playerNames = settings.playerNames;
    this.intervalMs = settings.intervalMs;
  }
}
