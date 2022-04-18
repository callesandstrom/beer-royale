import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';

export interface GameSettings {
  playerNames: string[];
  intervalMs: number;
}

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {

  emojies = ['🐢', '🐲', '🦄', '🐼', '🐷', '🐦', '🐬', '🐘', '🐒', '🐇', '🐧', '🐫', '🐠', '🐞', '🐝', '🐳', '🐶', '🐌', '🐻', '🦍'];

  intervalSec = new FormControl(5, Validators.required);

  players = new FormArray([
    new FormControl('Calle', Validators.required),
    new FormControl('Maria', Validators.required),
    new FormControl('Marcus', Validators.required),
    new FormControl('Niclas', Validators.required),
    new FormControl('Jesper', Validators.required),
    new FormControl('Young', Validators.required),
    new FormControl('Elin', Validators.required),
    new FormControl('Jocke', Validators.required),
    new FormControl('Oscar', Validators.required),
  ]);

  @Output() submitted = new EventEmitter<GameSettings>();

  addPlayer(): void {
    this.players.push(new FormControl(null, Validators.required));
  }

  removePlayer(index: number): void {
    this.players.removeAt(index);
  }

  submit(): void {
    this.submitted.emit({
      playerNames: this.players.value.map((name: string) => name + ' ' + this.getEmoji(name)),
      intervalMs: this.intervalSec.value * 1000
    });
  }

  private getEmoji(name: string): string {
    switch (name) {
      case 'Calle':
        return '🦁';
      case 'Maria':
        return '🐥';
      default:
        return this.getRandomEmoji();
    }
  }

  private getRandomEmoji(): string {
    const index = Math.floor(Math.random() * this.emojies.length);
    const emoji = this.emojies[index] ?? '🐛';

    this.emojies = this.emojies.filter((_, i) => i !== index);

    return emoji;
  }
}
