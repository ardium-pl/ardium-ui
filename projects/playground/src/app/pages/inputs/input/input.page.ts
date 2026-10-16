import { Component } from '@angular/core';
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
}
