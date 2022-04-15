import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  gameType = environment.gameType;

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(`${this.gameType} Royale`);
  }
}
