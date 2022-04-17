import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppState } from '../app.state';
import { BattleComponent } from './battle.component';

@Injectable({ providedIn: 'root' })
export class BattleGuard implements CanActivate, CanDeactivate<BattleComponent> {

  constructor(private store: Store, private router: Router) { }

  canActivate(): boolean | UrlTree {
    return !this.store.selectSnapshot(AppState.settings)
      ? this.router.createUrlTree(['/menu'])
      : true;
  };

  canDeactivate(): boolean {
    const { started, finished } = this.store.selectSnapshot(AppState.gameState);
    return !started || finished;
  }
}
