import { Component, signal } from '@angular/core';
import { StarColor as SC, StarFillMode as SF } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-stars',
  templateUrl: './stars.page.html',
  styleUrls: ['./stars.page.scss'],
})
export class StarsPage {
  colors: SC[] = Object.values(SC);
  fillModes: SF[] = Object.values(SF);

  valueFor5: number = 3.5;
  max: number = 10;
  valueFor10: number = 6.5;

  constructor(private _logger: Logger) {}
  log = this._logger.log;

  readonly ratingDisplayValue = signal<number>(3);
}
