import { computed, Directive, effect, ElementRef, inject, Inject, input, Renderer2, signal, SimpleChanges } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { _ButtonBase } from '../_button-base';
import { ButtonVariant } from '../general-button.types';
import { ARD_BUTTON_DEFAULTS, ArdButtonDefaults } from './button.defaults';

@Directive({
  selector: 'button[ard-button], a[ard-button]',
  standalone: false,
  host: {
    '[class]': 'ngClasses()',
    '[tabindex]': 'tabIndex()',
    '(click)': 'handleClick($event)',
  },
})
export class ArdiumButtonDirective extends _ButtonBase {
  protected override readonly _DEFAULTS!: ArdButtonDefaults;

  constructor(@Inject(ARD_BUTTON_DEFAULTS) defaults: ArdButtonDefaults) {
    super(defaults);

    const el: HTMLElement = this._hostEl.nativeElement;
    if (el.tagName === 'BUTTON') {
      effect(() => {
        this._renderer.setProperty(el, 'disabled', this.disabled());
      });
      effect(() => {
        this._renderer.setAttribute(el, 'type', this.type());
      });
    }
  }

  private readonly _hostEl = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);

  handleClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  //! button settings
  readonly variant = input<ButtonVariant>(this._DEFAULTS.variant);

  readonly vertical = input<boolean, BooleanLike>(this._DEFAULTS.vertical, { transform: v => coerceBooleanProperty(v) });
  readonly square = input<boolean, BooleanLike>(this._DEFAULTS.square, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [
      'ard-button',
      this.wrapperClasses(),
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-color-${this.color()}`,
      this.lightColoring() ? `ard-light-coloring` : '',
      this.disabled() ? 'ard-disabled' : '',
      this.compact() ? 'ard-compact' : '',
      this.vertical() ? 'ard-button-vertical' : '',
      this.square() ? 'ard-button-square' : '',
      this.pointerEventsWhenDisabled() ? 'ard-button-with-pointer-events-when-disabled' : '',
    ].join(' ')
  );

  //! inheriting from button groups
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
}
