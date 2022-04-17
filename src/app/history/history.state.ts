import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { map } from 'rxjs';
import { HistoryItem } from '../models';

export class LoadHistory {
  static readonly type = '[History] Load History';
}

export class AddHistory {
  static readonly type = '[History] Add History';
  constructor(public item: HistoryItem) { }
}

export class RemoveHistory {
  static readonly type = '[History] Remove History';
  constructor(public items: HistoryItem[]) { }
}

export interface HistoryStateModel {
  items: HistoryItem[];
}

@Injectable()
@State<HistoryStateModel>({
  name: 'history',
  defaults: {
    items: []
  }
})
export class HistoryState implements NgxsOnInit {

  @Selector()
  static history(state: HistoryStateModel): HistoryItem[] {
    return [...state.items].sort((a, b) => b.date - a.date);
  }

  constructor(private http: HttpClient) { }

  ngxsOnInit(context: StateContext<HistoryStateModel>) {
    context.dispatch(new LoadHistory());
  }

  @Action(LoadHistory)
  loadHistory(context: StateContext<HistoryStateModel>) {
    const cachedHistory: HistoryItem[] = JSON.parse(localStorage.getItem('history') ?? '[]');

    return this.http
      .get<HistoryItem[]>('assets/history.json')
      .pipe(map(jsonHistory => context.patchState({ items: [...jsonHistory, ...cachedHistory.filter(x => !jsonHistory.map(y => y.date).includes(x.date))] })));
  }

  @Action(AddHistory)
  addHistory(context: StateContext<HistoryStateModel>, { item }: AddHistory) {
    const state = context.getState();
    const history = [...state.items, item];

    this.setHistory(context, history);
  }

  @Action(RemoveHistory)
  removeHistory(context: StateContext<HistoryStateModel>, { items }: RemoveHistory) {
    const state = context.getState();
    const history = state.items.filter(x => !items.map(y => y.date).includes(x.date));

    this.setHistory(context, history);
  }

  private setHistory(context: StateContext<HistoryStateModel>, items: HistoryItem[]): void {
    localStorage.setItem('history', JSON.stringify(items));
    context.patchState({ items });
  }
}
