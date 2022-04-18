import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, filter, interval, startWith, takeWhile, withLatestFrom } from 'rxjs';

interface Player {
  name: string;
  hp: number;
  diedAtRound: number | null;
}

interface Round {
  number: number;
  attacks: Attack[];
}

interface Attack {
  playerName: string;
  enemyName: string;
  weapon: string;
  damage: number;
  criticalHit: boolean;
  isDeathblow: boolean;
}

const weapons = ['Eldboll', 'Kokosnöt', 'Regnbågsvätska', 'Fiskben', 'Rent gift', 'Majskolv', 'Häxvrål', 'Batong', 'Späckhuggare', 'Pulver', 'Ett mapp', 'Örfil', 'Trollstav', 'Mossa', 'Smör', 'Sin röst'];

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  started = false;
  finished = false;
  players!: Player[];
  rounds: Round[] = [];
  pause$ = new BehaviorSubject<boolean>(false);

  @Input() playerNames!: string[];
  @Input() intervalMs!: number;

  get alivePlayers(): Player[] {
    return this.players.filter(x => x.hp > 0);
  }

  get sortedPlayers(): Player[] {
    return this.players.slice().sort((a, b) => b.hp - a.hp || (b.diedAtRound ?? 0) - (a.diedAtRound ?? 0));
  }

  constructor(private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.players = this.playerNames.map<Player>(name => ({ name, hp: 100, diedAtRound: null }));
  }

  start(): void {
    this.started = true;

    interval(this.intervalMs)
      .pipe(
        startWith(0),
        withLatestFrom(this.pause$),
        filter(([_, pause]) => !pause),
        takeWhile(() => this.alivePlayers.length > 1)
      )
      .subscribe({
        next: () => this.calculateRound(),
        complete: () => this.finishGame()
      });
  }

  restart() {
    this.finished = false;
    this.players = this.players.map(player => ({ ...player, hp: 100, diedAtRound: null }));
    this.rounds = [];
    this.start();
  }

  pause(): void {
    this.pause$.next(true);
  }

  resume(): void {
    this.pause$.next(false);
  }

  private calculateRound(): void {
    const round = this.rounds.length + 1;
    const attacks: Attack[] = [];

    this.alivePlayers.forEach(player => {
      const enemies = this.alivePlayers.filter(x => player !== x);
      const enemy = enemies[Math.floor(Math.random() * enemies.length)] ?? { name: 'Spöke 👻', hp: 1 };
      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      const criticalHit = Math.random() * 100 > 95;
      const damage = Math.floor(Math.random() * 10) + 1;
      const finalDamage = criticalHit ? damage * 3 : damage;
      const newEnemyHp = Math.max(0, enemy.hp - finalDamage);
      const isDeathblow = newEnemyHp === 0;

      enemy.hp = newEnemyHp;

      if (isDeathblow) {
        enemy.diedAtRound = round;
      }

      attacks.push({ playerName: player.name, enemyName: enemy.name, weapon, damage: finalDamage, criticalHit, isDeathblow });
    });

    this.rounds.push({ number: round, attacks });
  }

  private finishGame(): void {
    this.finished = true;
    this.snackbar.open(this.getWinnerMessage());
  }

  private getWinnerMessage(): string {
    const alivePlayer = this.alivePlayers[0];

    if (alivePlayer) {
      return `Graaattiss ${alivePlayer.name} May you drink in peace 🥳🍻🎈`;
    }

    const tiedPlayers = this.players.filter(x => x.diedAtRound === this.rounds[this.rounds.length - 1].number);
    return `Ingen vinnare! 😬 Deathmatch mellan ${tiedPlayers.map(x => x.name).join(' och ')}`;
  }
}
