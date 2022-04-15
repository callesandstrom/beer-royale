import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clouds',
  templateUrl: './clouds.component.html',
  styleUrls: ['./clouds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloudsComponent { }
