import { Component, OnInit } from '@angular/core';
import { Record, SnackbarLoggerService } from '../snackbar-logger.service';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss']
})
export class LoggerComponent implements OnInit {

  constructor(
    private logger: SnackbarLoggerService,
  ) { }

  ngOnInit(): void {
  }

  get records(): Array<Record> {
    return this.logger.messages;
  }

}
