import { Directive, effect, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';

@Directive({
  selector: '[ard-error]',
  standalone: true,
  host: {
    '[class.ard-error]': 'true',
    '[class.ard-error-default]': '!left() && !right()',
    '[class.ard-error-left]': 'left() && !right()',
    '[class.ard-error-right]': '!left() && right()',
  },
})
export class ArdiumErrorDirective {
  readonly left = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly right = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  constructor() {
    effect(() => {
      if (this.left() && this.right()) {
        console.error(`ARD-NF5140: Cannot align a form field error to both left and right.`);
      }
    });
  }
}
