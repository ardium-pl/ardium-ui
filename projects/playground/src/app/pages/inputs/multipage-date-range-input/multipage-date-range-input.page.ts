import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { DateRange } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-multipage-date-range-input',
  templateUrl: './multipage-date-range-input.page.html',
  styleUrl: './multipage-date-range-input.page.scss',
})
export class MultipageDateRangeInputPage {
  readonly logger = inject(Logger);
  log = this.logger.log;

  readonly formControl = new FormControl<DateRange | null>(new DateRange(new Date(), new Date()));

  constructor() {
    this.formControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      console.log('formControl changes', v);
    });
  }
}
