import { ChangeDetectionStrategy, Component, Inject, OnChanges, SimpleChanges, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { _ButtonBase } from '../_button-base';
import { ButtonVariant } from '../general-button.types';
import { ARD_BUTTON_DEFAULTS, ArdButtonDefaults } from './button.defaults';

@Component({
  standalone: false,
  selector: 'ard-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ard-button-with-pointer-events-when-disabled]': 'pointerEventsWhenDisabled()',
  },
})
export class ArdiumButtonComponent extends _ButtonBase implements OnChanges {
  protected override readonly _DEFAULTS!: ArdButtonDefaults;

  constructor(@Inject(ARD_BUTTON_DEFAULTS) defaults: ArdButtonDefaults) {
    super(defaults);
  }

  //! events
  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  //! button settings
  readonly variant = input<ButtonVariant>(this._DEFAULTS.variant);

  readonly vertical = input<boolean, BooleanLike>(this._DEFAULTS.vertical, { transform: v => coerceBooleanProperty(v) });
  readonly square = input<boolean, BooleanLike>(this._DEFAULTS.square, { transform: v => coerceBooleanProperty(v) });

  readonly inheritedCompact = signal<boolean | null>(null);

  readonly wasCompactChanged = signal<boolean>(false);

  readonly compactOrInherited = computed(() =>
    this.wasCompactChanged() ? this.compact() : (this.inheritedCompact() ?? this.compact())
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['compact']) {
      this.wasCompactChanged.set(true);
    }
  }

  // stub definition to satisfy abstract class
  override readonly ngClasses = computed(() => '');
}
