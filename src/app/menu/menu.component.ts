import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppState, SetGameSettings } from '../app.state';
import { GameSettings } from '../models';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {

  emojies = ['🐢', '🐲', '🦄', '🐼', '🐷', '🐦', '🐬', '🐘', '🐒', '🐇', '🐧', '🐫', '🐠', '🐞', '🐝', '🐳', '🐶', '🐌', '🐻', '🦍'];

  settings?: GameSettings;
  players = new FormArray([new FormControl(null, Validators.required)]);
  intervalSec = new FormControl(5);

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
    this.settings = this.store.selectSnapshot(AppState.settings);

    if (this.settings) {
      this.players = new FormArray(this.settings.players.map(x => new FormControl(x.name, Validators.required)));
      this.intervalSec = new FormControl(this.settings.intervalMs / 1000);
    }
  }

  addPlayer(): void {
    this.players.push(new FormControl(null, Validators.required));
  }

  removePlayer(index: number): void {
    this.players.removeAt(index);
  }

  submit(): void {
    const settings: GameSettings = {
      players: this.players.value.map((name: string) => ({
        name,
        emoji: this.settings?.players.find(x => x.name === name)?.emoji ?? this.getRandomEmoji()
      })),
      intervalMs: this.intervalSec.value * 1000
    };

    this.store
      .dispatch(new SetGameSettings(settings))
      .subscribe(() => this.router.navigateByUrl('/battle'));
  }

  private getRandomEmoji(): string {
    const index = Math.floor(Math.random() * this.emojies.length);
    const emoji = this.emojies[index] ?? '🐛';

    this.emojies = this.emojies.filter((_, i) => i !== index);

    return emoji;
  }
}
