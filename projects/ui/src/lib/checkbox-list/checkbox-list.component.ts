import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  HostBinding,
  Inject,
  Input,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { SimpleItemStorage, SimpleItemStorageHost } from '../_internal/item-storages/simple-item-storage';
import { _NgModelComponentBase } from '../_internal/ngmodel-component';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { ComponentColor } from '../types/colors.types';
import { ArdOptionSimple, CompareWithFn, OptionContext } from '../types/item-storage.types';
import { Nullable } from '../types/utility.types';
import { ARD_CHECKBOX_LIST_DEFAULTS, ArdCheckboxListDefaults } from './checkbox-list.defaults';
import { ArdCheckboxListCheckboxTemplateDirective, ArdCheckboxListLabelTemplateDirective } from './checkbox-list.directives';
import { CheckboxListAlignType } from './checkbox-list.types';

@Component({
  standalone: false,
  selector: 'ard-checkbox-list',
  templateUrl: './checkbox-list.component.html',
  styleUrls: ['./checkbox-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumCheckboxListComponent
  extends _NgModelComponentBase
  implements SimpleItemStorageHost, Omit<FormValueControl<any[]>, 'readonly' | 'disabled'>
{
  protected override readonly _DEFAULTS!: ArdCheckboxListDefaults;
  constructor(@Inject(ARD_CHECKBOX_LIST_DEFAULTS) defaults: ArdCheckboxListDefaults) {
    super(defaults);
  }

  //! removed bindings
  /**
   * @deprecated Use `[maxLength]` instead.
   */
  readonly maxSelectedItems = input<undefined, never>(undefined, { transform: () => undefined });
  /**
   * @deprecated Use `[options]` instead.
   */
  readonly items = input<undefined, never>(undefined, { transform: () => undefined });
  /**
   * @deprecated Use `[value]` instead.
   */
  readonly selected = input<undefined, never>(undefined, { transform: () => undefined });
  /**
   * @deprecated Use `(valueChange)` instead.
   */
  readonly selectedChange = output<never>();

  @HostBinding('attr.id')
  get _htmlIdHostAttribute() {
    return this.htmlId();
  }

  readonly DEFAULTS = this._DEFAULTS;
  // static values. Not meant to be changed.
  readonly multiselectable = signal<true>(true);
  readonly isValueRequired = signal<false>(false);
  readonly _componentId = '300';
  readonly _componentName = 'checkbox-list';

  private readonly _itemStorage = new SimpleItemStorage(this);

  readonly valueFrom = input<string>(this._DEFAULTS.valueFrom);
  readonly labelFrom = input<string>(this._DEFAULTS.labelFrom);
  readonly disabledFrom = input<string>(this._DEFAULTS.disabledFrom);

  @Input({ alias: 'options' })
  set options(v: any[]) {
    this._itemStorage.setItems(v);
  }
  get options(): ArdOptionSimple[] {
    return this._itemStorage.options();
  }

  readonly compareWith = input<Nullable<CompareWithFn>>(this._DEFAULTS.compareWith);

  readonly invertDisabled = input<boolean, BooleanLike>(this._DEFAULTS.invertDisabled, {
    transform: v => coerceBooleanProperty(v),
  });

  // @ts-expect-error to keep typed transform, but adhere to the FormValueControl interface
  readonly maxLength = input<number, NumberLike>(this._DEFAULTS.maxLength, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.maxLength),
  });

  //! appearance
  readonly color = input<ComponentColor>(this._DEFAULTS.color);
  readonly align = input<CheckboxListAlignType>(this._DEFAULTS.align);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [`ard-color-${this.color()}`, `ard-align-${this.align()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! value
  readonly value = model<any[]>([]);

  onItemHighlight(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    this._itemStorage.highlightSingleItem(v);
  }
  onItemFocus(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    this._itemStorage.highlightSingleItem(v);
  }
  onItemBlur(): void {
    this._itemStorage.unhighlightAll();
  }
  selectItem(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    this._itemStorage.selectItem(v);
    this._emitTouched();
  }
  unselectItem(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    this._itemStorage.unselectItem(v);
    this._emitTouched();
  }
  toggleItem(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    if (v.selected) {
      this.unselectItem(v);
      return;
    }
    this.selectItem(v);
  }

  //! templates
  readonly checkboxTemplate = contentChild(ArdCheckboxListCheckboxTemplateDirective);

  readonly labelTemplate = contentChild(ArdCheckboxListLabelTemplateDirective);

  readonly labelComponent = this._DEFAULTS.LabelComponent;

  readonly labelContextGenerator = computed<(item: ArdOptionSimple) => OptionContext<ArdOptionSimple>>(() => item => ({
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

  readonly labelComponentInputsGenerator = contextToInputs(this.labelContextGenerator, this.labelComponent);
}
