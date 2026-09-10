import { computed, Directive, ElementRef, input, output, QueryList, signal, ViewChildren } from '@angular/core';
import { coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { _DisablableComponentBase, _disablableComponentDefaults, _DisablableComponentDefaults } from './disablable-component';

export interface _FocusableComponentDefaults extends _DisablableComponentDefaults {
  tabIndex: number;
}
export const _focusableComponentDefaults: _FocusableComponentDefaults = {
  ..._disablableComponentDefaults,
  tabIndex: 0,
};

@Directive()
export abstract class _FocusableComponentBase extends _DisablableComponentBase {
  protected override readonly _DEFAULTS!: _FocusableComponentDefaults;

  //! make the component focusable programmatically
  @ViewChildren('focusableElement')
  private readonly _focusableElement!: QueryList<ElementRef<HTMLElement>>;

  /**
   * Focuses the correct element in the component.
   */
  public focus(): void {
    this._focusableElement?.first?.nativeElement.focus();
  }
  /**
   * Focuses the first of all available elements in the component.
   */
  public focusFirst(): void {
    this.focus();
  }
  /**
   * Focuses the last of all available elements in the component.
   */
  public focusLast(): void {
    this._focusableElement?.last?.nativeElement.focus();
  }
  /**
   * Blurs all focusable elements in the component.
   */
  public blur(): void {
    this._focusableElement?.forEach(el => el.nativeElement.blur());
  }

  //! tabindex
  /**
   * The component's overall tab index. If the component is disabled, it is always `-1`. Coercible into a number, defaults to `0`.
   */
  readonly tabIndex = computed(() => (this.disabled() ? -1 : this._tabIndex()));
  readonly _tabIndex = input<number, NumberLike>(this._DEFAULTS.tabIndex, {
    alias: 'tabIndex',
    transform: v => coerceNumberProperty(v, 0),
  });

  //! events
  /**
   * The event emitter responsible for firing `focus` events.
   */
  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  /**
   * The event emitter responsible for firing `blur` events.
   */
  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  //! focus event handlers
  /**
   * Whether the component is currently focused.
   */
  readonly isFocused = signal<boolean>(false);

  /**
   * Function to handle when an element is focused. Sets `isFocused` and fires the `focus` event.
   * @param event The focus event to emit.
   */
  onFocus(event: FocusEvent) {
    this.isFocused.set(true);
    this.focusEvent.emit(event);
  }
  /**
   * Function to handle when an element is blurred. Sets `isFocused` and fires the `blur` event.
   * @param event The focus event to emit.
   */
  onBlur(event: FocusEvent) {
    this.isFocused.set(false);
    this.blurEvent.emit(event);
  }
}
