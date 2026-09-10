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
import { BooleanLike, coerceArrayProperty, coerceBooleanProperty } from '@ardium-pl/devkit';
import { ARD_KBD_DEFAULTS } from '../kbd/kbd.defaults';
import { FormElementAppearance } from '../types/theming.types';
import { Nullable } from '../types/utility.types';
import { ARD_KBD_SHORTCUT_DEFAULTS } from './kbd-shortcut.defaults';

@Component({
  standalone: false,
  selector: 'ard-kbd-shortcut',
  templateUrl: './kbd-shortcut.component.html',
  styleUrls: ['./kbd-shortcut.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumKbdShortcutComponent implements AfterViewInit {
  protected readonly _KBD_DEFAULTS = inject(ARD_KBD_DEFAULTS);
  protected readonly _DEFAULTS = inject(ARD_KBD_SHORTCUT_DEFAULTS);

  readonly contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapperEl');

  ngAfterViewInit(): void {
    if (!this.keys() && !this.contentWrapper()?.nativeElement.innerText) {
      throw new Error(`ARD-FT5040: Using <ard-kbd-shortcut> without specifying the [keys] field is not allowed.`);
    }
  }

  readonly splitRegex = /[+, ]/;
  readonly keys = input<Nullable<string[]>, Nullable<string | string[]>>(undefined, {
    transform: v => coerceArrayProperty(v, this.splitRegex),
  });

  readonly full = input<boolean, BooleanLike>(this._DEFAULTS.full ?? this._KBD_DEFAULTS.full, {
    transform: v => coerceBooleanProperty(v),
  });

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance ?? this._KBD_DEFAULTS.appearance);

  readonly ngClasses = computed<string>(() => [`ard-appearance-${this.appearance}`].join(' '));
}
