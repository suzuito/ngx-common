import { Component, Inject } from '@angular/core';
import { Record, SnackbarLoggerService } from './snackbar-logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'demo1';

  constructor(
    private logger: SnackbarLoggerService,
  ) { }

  clickClear(): void {
    this.logger.clear();
  }
}
