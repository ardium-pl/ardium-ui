import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
    computed,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { FormElementAppearance } from './../types/theming.types';
import { ARD_KBD_DEFAULTS } from './kbd.defaults';

@Component({
  standalone: false,
  selector: 'ard-kbd',
  templateUrl: './kbd.component.html',
  styleUrls: ['./kbd.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumKbdComponent implements AfterViewInit {
  protected readonly _DEFAULTS = inject(ARD_KBD_DEFAULTS);

  readonly contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapperEl');

  ngAfterViewInit(): void {
    if (!this.key() && !this.contentWrapper()!.nativeElement.innerText) {
      throw new Error(`ARD-FT5030: Using <ard-kbd> without specifying the [key] field is not allowed.`);
    }
  }

  readonly key = input<string>('');
  readonly full = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! appearance
  readonly appearance = input<FormElementAppearance>(FormElementAppearance.Filled);

  readonly ngClasses = computed<string>(() => [`ard-appearance-${this.appearance()}`].join(' '));
}
