import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppState, SetGameSettings } from '../app.state';
import { GameSettings } from '../models';

const emojies = ['🐢', '🐲', '🦄', '🐼', '🐷', '🐦', '🐬', '🐘', '🐒', '🐇', '🐧', '🐫', '🐠', '🐞', '🐝', '🐳', '🐶', '🐌', '🐻', '🦍', '🦁', '🐥', '🐎', '🦊', '🦌', '🦏', '🐅', '🐨'];

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {

  settings?: GameSettings;
  players = new FormArray([this.createPlayerFormGroup()]);
  intervalSec = new FormControl(5);

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
    this.settings = this.store.selectSnapshot(AppState.settings);

    if (this.settings) {
      this.players = new FormArray(this.settings.players.map(x => this.createPlayerFormGroup(x)));
      this.intervalSec = new FormControl(this.settings.intervalMs / 1000);
    }
  }

  addPlayer(): void {
    this.players.push(this.createPlayerFormGroup());
  }

  removePlayer(index: number): void {
    this.players.removeAt(index);
  }

  shuffleEmoji(event: Event, player: FormGroup) {
    event.stopPropagation();
    player.setValue({ ...player.value, emoji: this.getRandomEmoji() });
  }

  submit(): void {
    const settings: GameSettings = {
      players: this.players.value,
      intervalMs: this.intervalSec.value * 1000
    };

    this.store
      .dispatch(new SetGameSettings(settings))
      .subscribe(() => this.router.navigateByUrl('/battle'));
  }

  private createPlayerFormGroup(player?: { name: string; emoji: string }): FormGroup {
    return new FormGroup({
      name: new FormControl(player?.name, Validators.required),
      emoji: new FormControl(player?.emoji ?? this.getRandomEmoji(), Validators.required),
    });
  }

  private getRandomEmoji(): string {
    const takenEmojies = this.players?.controls.map(x => x.value.emoji) ?? [];
    const availableEmojis = emojies.filter(x => !takenEmojies.includes(x));
    const index = Math.floor(Math.random() * availableEmojis.length);

    return availableEmojis[index] ?? '🐛';
  }
}
