import { Injectable } from '@angular/core';

export interface Record {
  createdAt: number;
  cols: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarLoggerService {

  public messages: Array<Record>;

  constructor(
  ) {
    this.messages = [];
  }

  info(...args: Array<string>): void {
    this.messages.push({
      createdAt: Date.now() / 1000,
      cols: args,
    });
  }

  clear(): void {
    this.messages = [];
  }
}
