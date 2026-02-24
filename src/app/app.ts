import {Component, signal} from '@angular/core';
import {CrudPageComponent} from './features/crud/pages/crud-page.component/crud-page.component';

@Component({
  selector: 'app-root',
  imports: [
    CrudPageComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('crud-material');
}
