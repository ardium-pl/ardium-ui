import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ProgressCircleAppearance,
  ProgressCircleVariant,
  SimpleComponentColor
} from 'projects/ui/src/public-api';

@Component({
  standalone: false,
  selector: 'app-progress-circle',
  templateUrl: './progress-circle.page.html',
  styleUrls: ['./progress-circle.page.scss'],
})
export class ProgressCirclePage implements OnInit, OnDestroy {
  appearances: ProgressCircleAppearance[] = Object.values(ProgressCircleAppearance);
  variants: ProgressCircleVariant[] = Object.values(ProgressCircleVariant);
  colors: SimpleComponentColor[] = Object.values(SimpleComponentColor);

  currentTimerValue: number = 0;

  private _interval?: NodeJS.Timeout;
  ngOnInit(): void {
    this._interval = setInterval(() => {
      if (this.currentTimerValue >= 30) {
        this.currentTimerValue = 0;
      } else this.currentTimerValue += 0.05;
    }, 50);
  }
  ngOnDestroy(): void {
    if (!this._interval) return;

    clearInterval(this._interval);
  }
}
