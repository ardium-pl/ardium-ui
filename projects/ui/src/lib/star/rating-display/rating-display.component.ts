import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, ViewEncapsulation } from '@angular/core';
import { coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { isArray, isNumber } from 'simple-bool';
import { StarColor, StarFillMode } from './../star.types';
import { ARD_RATING_DISPLAY_DEFAULTS } from './rating-display.defaults';
import { ArdRatingDisplayStarTemplateDirective } from './rating-display.directives';
import { ArdRatingDisplayStarTemplateContext } from './rating-display.types';

@Component({
  standalone: false,
  selector: 'ard-rating-display',
  templateUrl: './rating-display.component.html',
  styleUrls: ['./rating-display.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumRatingDisplayComponent {
  readonly wrapperClasses = input<string>('');

  protected readonly _DEFAULTS = inject(ARD_RATING_DISPLAY_DEFAULTS);

  //! appearance
  readonly color = input<StarColor>(this._DEFAULTS.color);

  readonly ngClasses = computed<string>(() => [this.wrapperClasses(), `ard-color-${this.color}`].join(' '));

  //! stars
  readonly max = input<number, NumberLike>(this._DEFAULTS.max, { transform: v => coerceNumberProperty(v, this._DEFAULTS.max) });

  readonly value = input<number | StarFillMode[], string | number | StarFillMode[]>(this._DEFAULTS.value, {
    transform: v => {
      if (isArray(v)) {
        return v;
      }
      return coerceNumberProperty(v, 0);
    },
  });

  readonly starArray = computed<StarFillMode[]>(() => {
    let v = this.value();
    let newArr: StarFillMode[];

    // pad the array with non-filled stars and return it
    if (isArray(v)) {
      newArr = [...v];
      while (newArr.length < this.max()) {
        newArr.push(StarFillMode.None);
      }
      return newArr;
    }

    // create an array from a numeric value
    newArr = [];
    while (newArr.length < this.max()) {
      v--;
      if (v + 1 >= 1) {
        newArr.push(StarFillMode.Filled);
        continue;
      }
      if (Math.round(v + 1) === 1) {
        newArr.push(StarFillMode.Half);
        continue;
      }
      newArr.push(StarFillMode.None);
    }
    return newArr;
  });

  //! template
  readonly starTemplate = contentChild(ArdRatingDisplayStarTemplateDirective);

  readonly getStarTemplateContext = computed<(fillMode: StarFillMode, index: number) => ArdRatingDisplayStarTemplateContext>(
    () => (fillMode, index) => ({
      $implicit: fillMode,
      fillMode,
      index,
      valueIndex: isNumber(this.value()) ? (this.value() as number) - 1 : -1,
      color: this.color(),
    })
  );
}
