import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SliderRange, SliderTooltipFormatFn } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-range-slider',
  templateUrl: './range-slider.page.html',
  styleUrls: ['./range-slider.page.scss'],
})
export class RangeSliderPage {
  constructor(private _logger: Logger) {}
  log = this._logger.log;

  readonly tooltipFormatFn: SliderTooltipFormatFn = (v: number): string => String(v / 1000) + 'k';

  readonly value = signal<SliderRange>({ from: 20, to: 50 });
  readonly valueAllow = signal<SliderRange>({ from: 20, to: 50 });
  readonly valueBlock = signal<SliderRange>({ from: 20, to: 50 });
  readonly valuePush = signal<SliderRange>({ from: 20, to: 50 });
  readonly valueBlock2 = signal<SliderRange>({ from: 20, to: 50 });
  readonly valuePush2 = signal<SliderRange>({ from: 20, to: 50 });
  

  readonly control = new FormControl<SliderRange>({ from: 20, to: 50 });
}
