import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HistoryItem } from '../models';
import { HistoryState, RemoveHistory } from './history.state';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {

  @Select(HistoryState.history) history$: Observable<HistoryItem[]>;

  constructor(private store: Store, private snackbar: MatSnackBar) { }

  removeItems(list: MatSelectionList): void {
    if (confirm('Är du säker på att du vill ta bort markerade rader?')) {
      const items = list.selectedOptions.selected.map(x => x.value);
      this.store.dispatch(new RemoveHistory(items)).subscribe(() => list.deselectAll());
    }
  }

  copyAsJson(): void {
    const history = this.store.selectSnapshot(HistoryState.history);
    const text = JSON.stringify(history.map(x => ({ ...x, isSaved: true })));

    navigator.clipboard.writeText(text).then(() => this.snackbar.open('Historiken kopierades som JSON 🤓', undefined, { duration: 3000 }));
  }
}
