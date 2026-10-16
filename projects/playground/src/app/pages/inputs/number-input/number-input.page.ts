import { Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormElementAppearance as FA, FormElementVariant as FV } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  templateUrl: './number-input.page.html',
  styleUrls: ['./number-input.page.scss'],
})
export class NumberInputPage {
  appearances: FA[] = Object.values(FA);
  variants: FV[] = Object.values(FV);
  value: number | null = 0;
  min: number = -10;
  max: number = 100;
  stepSize: number = 5;

  constructor(private _logger: Logger) {}
  log = this._logger.log;

  readonly maxSignal = signal<number>(1);

  readonly valueDecPl = signal<number>(5);
  readonly valueFixedDecPl = signal<number>(5);

  increaseMax() {
    setTimeout(() => {
      this.maxSignal.update(v => v + 1);
    }, 3000);
  }

  readonly control = new FormControl(null, [Validators.max(1000)]);
}
