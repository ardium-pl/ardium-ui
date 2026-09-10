import { Directive, effect, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';

@Directive({
  selector: '[ard-hint]',
  standalone: true,
  host: {
    '[class.ard-hint]': 'true',
    '[class.ard-hint-default]': '!left() && !right()',
    '[class.ard-hint-left]': 'left() && !right()',
    '[class.ard-hint-right]': '!left() && right()',
  },
})
export class ArdiumHintDirective {
  readonly left = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly right = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  constructor() {
    effect(() => {
      if (this.left() && this.right()) {
        console.error(`ARD-NF5130: Cannot align a form field hint to both left and right.`);
      }
    });
  }
}
