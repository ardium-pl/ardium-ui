import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { CheckboxState, SimpleComponentColor as SCC } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-checkbox',
  templateUrl: './checkbox.page.html',
  styleUrls: ['./checkbox.page.scss'],
})
export class CheckboxPage {
  states: CheckboxState[] = Object.values(CheckboxState);
  colors: SCC[] = Object.values(SCC);

  fontsize: number = 24;

  readonly control = new FormControl(true);

  readonly formModel = signal({
    value1: false,
  });
  readonly signalForm = form(this.formModel);

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
