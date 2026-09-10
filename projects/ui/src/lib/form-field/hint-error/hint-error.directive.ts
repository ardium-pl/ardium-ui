import { Directive, effect, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';

@Directive({
  selector: '[ard-hint-error]',
  standalone: true,
  host: {
    '[class.ard-hint-error]': 'true',
    '[class.ard-hint]': 'true',
    '[class.ard-error-default]': '!left() && !right()',
    '[class.ard-error-left]': 'left() && !right()',
    '[class.ard-error-right]': '!left() && right()',
    '[class.ard-error]': 'true',
    '[class.ard-hint-default]': '!left() && !right()',
    '[class.ard-hint-left]': 'left() && !right()',
    '[class.ard-hint-right]': '!left() && right()',
  },
})
export class ArdiumHintErrorDirective {
  readonly left = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly right = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  constructor() {
    effect(() => {
      if (this.left() && this.right()) {
        console.error(`ARD-NF5150: Cannot align a form field hint-error to both left and right.`);
      }
    });
  }
}
