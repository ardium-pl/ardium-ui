import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { FormElementAppearance } from '../../../../../../ui/src/public-api';
import { Logger } from './../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-input',
  templateUrl: './input.page.html',
  styleUrls: ['./input.page.scss'],
})
export class InputPage {
  appearances: FormElementAppearance[] = Object.values(FormElementAppearance);
  value: string = 'Hello world!';
  maxLength = 15;

  constructor(private _logger: Logger) {}
  log = this._logger.log;

  readonly control = new FormControl('Hello world!');

  readonly formValue = signal({
    input1: 'Hello world!',
  });
  readonly form = form(this.formValue);
}
