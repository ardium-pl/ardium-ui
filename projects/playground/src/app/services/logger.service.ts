import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Logger {
  log(...args: any[]): void {
    console.log(...args);
  }
  logAsTable(name: string, data: any): void {
    console.table({ [name]: data });
  }
}
