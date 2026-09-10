import {
    ChangeDetectorRef,
    Directive,
    HostBinding,
    HostListener,
    Input,
    computed,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BooleanLike, coerceArrayProperty, coerceBooleanProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import { ArdFormFieldControl } from '../form-field/form-field-child.token';
import { ArdOptionSimple, CompareWithFn, OptionContext } from '../types/item-storage.types';
import { Nullable } from '../types/utility.types';
import { _FormFieldComponentBase, _FormFieldComponentDefaults, _formFieldComponentDefaults } from './form-field-component';
import { SimpleItemStorage, SimpleItemStorageHost } from './item-storages/simple-item-storage';

export interface _SelectableListComponentDefaults extends _FormFieldComponentDefaults {
  valueFrom: string;
  labelFrom: string;
  disabledFrom: string;
  compareWith: Nullable<CompareWithFn>;
  multiselectable: boolean;
  requireValue: boolean;
  invertDisabled: boolean;
  maxSelectedItems: Nullable<number>;
}
export const _selectableListComponentDefaults: _SelectableListComponentDefaults = {
  ..._formFieldComponentDefaults,
  valueFrom: 'value',
  labelFrom: 'label',
  disabledFrom: 'disabled',
  compareWith: undefined,
  multiselectable: false,
  requireValue: false,
  invertDisabled: false,
  maxSelectedItems: undefined,
};

@Directive()
export abstract class _SelectableListComponentBase
  extends _FormFieldComponentBase
  implements ControlValueAccessor, SimpleItemStorageHost, ArdFormFieldControl
{
  protected override readonly _DEFAULTS!: _SelectableListComponentDefaults;

  //! public constants
  readonly itemStorage = new SimpleItemStorage(this);
  readonly element!: HTMLElement;
  readonly DEFAULTS = this._DEFAULTS;

  abstract readonly _componentId: string;
  abstract readonly _componentName: string;

  private readonly _cd = inject(ChangeDetectorRef);

  //! binding-related inputs
  readonly valueFrom = input<string>(this._DEFAULTS.valueFrom);
  readonly labelFrom = input<string>(this._DEFAULTS.labelFrom);
  readonly disabledFrom = input<string>(this._DEFAULTS.disabledFrom);
  readonly compareWith = input<Nullable<CompareWithFn>>(this._DEFAULTS.compareWith);

  //! items setter/getter
  @Input()
  get items(): any[] {
    return this.itemStorage.items();
  }
  set items(value: any) {
    if (!Array.isArray(value)) value = coerceArrayProperty(value);

    this.itemStorage.setItems(value);
  }

  //! multiselectable
  readonly multiselectable = input<boolean, BooleanLike>(this._DEFAULTS.multiselectable, {
    transform: v => coerceBooleanProperty(v),
  });

  @HostBinding('attr.multiple')
  @HostBinding('class.ard-multiselect')
  get _multiselectableHostAttribute() {
    return this.multiselectable();
  }

  readonly singleselectable = computed(() => !this.multiselectable());

  //! require value
  readonly requireValue = input<boolean, BooleanLike>(this._DEFAULTS.requireValue, { transform: v => coerceBooleanProperty(v) });

  readonly isValueRequired = computed(() => this.requireValue() || !this.multiselectable());

  @HostBinding('class.ard-require-value')
  get _requireValueHostAttribute() {
    return this.requireValue();
  }

  //! coerced properties
  readonly invertDisabled = input<boolean, BooleanLike>(this._DEFAULTS.invertDisabled, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly maxSelectedItems = input<Nullable<number>, any>(this._DEFAULTS.maxSelectedItems, {
    transform: v => coerceNumberProperty(v, undefined),
  });

  //! control value accessor
  //override the writeValue and setDisabledState defined in _NgModelComponent
  override setDisabledState(state: boolean): void {
    this.disabled.set(state);
    this._cd.markForCheck();
  }
  writeValue(ngModel: any[]): void {
    this.itemStorage.writeValue(ngModel);
    this._cd.markForCheck();
  }

  //! change & touch event emitters
  readonly touched = signal<boolean>(false);

  @HostBinding('class.ard-touched')
  get _touchedHostAttribute(): boolean {
    return this.touched();
  }

  protected _emitChange(): void {
    const value = this.singleselectable() ? this.itemStorage.value()[0] : this.itemStorage.value();
    this._onChangeRegistered?.(value);
    this.valueChange.emit(value);
  }
  protected _onTouched(): void {
    if (this.touched()) return;

    this._onTouchedRegistered?.();
    this.touched.set(true);
  }

  //! focus & blur handlers
  private readonly lastBlurTimestamp = signal<Nullable<number>>(undefined);
  override onFocus(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    super.onFocus(event);

    const lbt = this.lastBlurTimestamp();
    if (this.touched() || !lbt || lbt + 1 < Date.now()) return;
    this.lastBlurTimestamp.set(null);

    this._onTouched();
  }
  override onBlur(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    super.onBlur(event);

    if (!this.touched()) this.lastBlurTimestamp.set(Date.now());
  }

  //! getters
  readonly highlightedItems = computed<ArdOptionSimple[]>(() => this.itemStorage.highlightedItems());
  readonly firstHighlightedItem = computed<Nullable<ArdOptionSimple>>(() => this.highlightedItems()?.first());
  readonly isItemLimitReached = computed(() => this.itemStorage.isItemLimitReached());

  //! context providers
  readonly optionContextGenerator = computed<(item: ArdOptionSimple) => OptionContext<ArdOptionSimple>>(() => item => ({
    $implicit: item,
    item,
    index: item.index,
    value: item.value,
    label: item.label,
    selected: item.selected,
    highlighted: item.highlighted,
    itemData: item.itemData,
    disabled: item.disabled,
  }));

  //! value input & output
  @Input()
  set value(newValue: any) {
    if (this.multiselectable() && !Array.isArray(newValue)) newValue = coerceArrayProperty(newValue);
    this.writeValue(newValue);
  }
  readonly valueChange = output<any[] | any>();

  //! output events
  readonly addEvent = output<any[]>({ alias: 'add' });
  readonly removeEvent = output<any[]>({ alias: 'remove' });

  //! item selection handlers
  toggleItem(item: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    if (item.selected) {
      if (this.singleselectable()) return;

      this.unselectItem(item);
      return;
    }
    this.selectItem(item);
  }
  selectItem(...items: ArdOptionSimple[]): void {
    if (this.disabled() || this.readonly()) return;
    const [selected, unselected] = this.itemStorage.selectItem(...items);

    if (unselected.length > 0) this.removeEvent.emit(unselected);

    if (selected.length > 0) {
      this.addEvent.emit(selected);
      this._emitChange();
    }
  }
  unselectItem(...items: ArdOptionSimple[]): void {
    if (this.disabled() || this.readonly()) return;
    const unselected = this.itemStorage.unselectItem(...items);

    if (unselected.length > 0) this.removeEvent.emit(unselected);

    this._emitChange();
  }

  //! highligh-related

  readonly isMouseBeingUsed = signal<boolean>(false);
  @HostListener('mousemove')
  onMouseMove() {
    this.isMouseBeingUsed.set(true);
  }
  onItemMouseEnter(option: ArdOptionSimple, event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (!this.isMouseBeingUsed) return;
    this.itemStorage.highlightSingleItem(option);
    event.stopPropagation();
  }
  onItemMouseLeave(option: ArdOptionSimple, event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (!this.isMouseBeingUsed) return;
    this.itemStorage.unhighlightItem(option);
    event.stopPropagation();
  }

  //! click handlers
  onItemClick(option: ArdOptionSimple, event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    event.stopPropagation();
    this.toggleItem(option);
  }

  //! key press handlers
  @HostListener('keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) {
      if (event.code === 'Space') {
        event.preventDefault();
      }
      return;
    }
    switch (event.code) {
      case 'Space':
      case 'Enter': {
        this._toggleHighlightedItems(event);
        return;
      }
      case 'ArrowRight': {
        this._highlightNext(event);
        return;
      }
      case 'ArrowLeft': {
        this._highlightPrevious(event);
        return;
      }
      case 'Home': {
        this._highlightFirst(event);
        return;
      }
      case 'End': {
        this._highlightLast(event);
        return;
      }
      case 'KeyA': {
        if (event.ctrlKey) {
          this._highlightAll();
          return;
        }
      }
    }
  }
  private _toggleHighlightedItems(event: KeyboardEvent): void {
    if (!this.isFocused()) return;

    event.preventDefault();

    const highlightedItems = this.highlightedItems();

    if (highlightedItems.every(item => item.selected)) {
      this.unselectItem(...highlightedItems);
    } else {
      this.selectItem(...highlightedItems);
    }
  }
  private _highlightPrevious(event: KeyboardEvent): void {
    if (!this.isFocused()) return;

    event.preventDefault();
    this.isMouseBeingUsed.set(false);

    this.itemStorage.highlightNextItem(-1, event.shiftKey);
  }
  private _highlightNext(event: KeyboardEvent): void {
    if (!this.isFocused()) return;

    event.preventDefault();
    this.isMouseBeingUsed.set(false);

    this.itemStorage.highlightNextItem(+1, event.shiftKey);
  }
  private _highlightFirst(event: KeyboardEvent): void {
    if (!this.isFocused()) return;

    event.preventDefault();
    this.isMouseBeingUsed.set(false);

    this.itemStorage.highlightFirstItem();
  }
  private _highlightLast(event: KeyboardEvent): void {
    if (!this.isFocused()) return;

    event.preventDefault();
    this.isMouseBeingUsed.set(false);

    this.itemStorage.highlightLastItem();
  }
  private _highlightAll(): void {
    this.itemStorage.highlightAllItems();
  }
}
