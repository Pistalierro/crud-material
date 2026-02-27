import {Component, inject} from '@angular/core';
import {CrudPageComponent} from './features/crud/pages/crud-page.component/crud-page.component';
import {AuthSessionService} from './core/services/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [
    CrudPageComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private readonly authSessionService = inject(AuthSessionService);

  constructor() {
    void this.authSessionService.ensureAnonymousAuth();
  }
}
