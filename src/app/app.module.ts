import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeSv from '@angular/common/locales/sv';
import { LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { AppState } from './app.state';
import { BattleComponent } from './battle/battle.component';
import { BattleGuard } from './battle/battle.guard';
import { CloudsComponent } from './clouds/clouds.component';
import { HeaderComponent } from './header/header.component';
import { HistoryComponent } from './history/history.component';
import { HistoryState } from './history/history.state';
import { AutofocusDirective } from './menu/autofocus.directive';
import { MenuComponent } from './menu/menu.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

registerLocaleData(localeSv);

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HeaderComponent,
    CloudsComponent,
    BattleComponent,
    ToolbarComponent,
    HistoryComponent,
    AutofocusDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    NgxsModule.forRoot(
      !environment.historyDisabled ? [AppState, HistoryState] : [AppState],
      { developmentMode: !environment.production }
    ),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
    RouterModule.forRoot([
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
      { path: 'menu', component: MenuComponent },
      { path: 'battle', canActivate: [BattleGuard], canDeactivate: [BattleGuard], component: BattleComponent },
      { path: 'history', component: HistoryComponent },
      { path: '**', redirectTo: '' },
    ])
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'sv' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
