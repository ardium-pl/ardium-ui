import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  HostBinding,
  Inject,
  Input,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { SimpleItemStorage, SimpleItemStorageHost } from '../_internal/item-storages/simple-item-storage';
import { _NgModelComponentBase } from '../_internal/ngmodel-component';
import { contextToInputsMultiple } from '../_internal/utils/context-to-inputs';
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
export class ArdiumCheckboxListComponent extends _NgModelComponentBase implements SimpleItemStorageHost, AfterViewInit {
  protected override readonly _DEFAULTS!: ArdCheckboxListDefaults;
  constructor(@Inject(ARD_CHECKBOX_LIST_DEFAULTS) defaults: ArdCheckboxListDefaults) {
    super(defaults);
  }

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

  @Input()
  set items(v: any[]) {
    this._itemStorage.setItems(v);
  }
  get items(): ArdOptionSimple[] {
    return this._itemStorage.items();
  }

  readonly compareWith = input<Nullable<CompareWithFn>>(this._DEFAULTS.compareWith);

  readonly invertDisabled = input<boolean, BooleanLike>(this._DEFAULTS.invertDisabled, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly maxSelectedItems = input<number, NumberLike>(this._DEFAULTS.maxSelectedItems, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.maxSelectedItems),
  });

  //! appearance
  readonly color = input<ComponentColor>(this._DEFAULTS.color);
  readonly align = input<CheckboxListAlignType>(this._DEFAULTS.align);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [`ard-color-${this.color()}`, `ard-align-${this.align()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! value
  @Input()
  get value(): any {
    return this._itemStorage.value();
  }
  set value(v: any) {
    this.writeValue(v);
  }

  readonly valueChange = output<any>();

  private _valueBeforeInit: any;
  writeValue(v: any): void {
    if (!this._isViewInit) {
      this._valueBeforeInit = v;
      return;
    }
    this._itemStorage.writeValue(v);
  }

  private _isViewInit = false;
  ngAfterViewInit(): void {
    this._isViewInit = true;

    if (this._valueBeforeInit) {
      this.writeValue(this._valueBeforeInit);
    }
  }

  protected _emitChange(): void {
    const v = this.value;
    this._onChangeRegistered?.(v);
    this.valueChange.emit(v);
  }

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
    this._emitChange();
    this._emitTouched();
  }
  unselectItem(v: ArdOptionSimple): void {
    if (this.disabled() || this.readonly()) return;
    this._itemStorage.unselectItem(v);
    this._emitChange();
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

  readonly labelComponentInputsGenerator = contextToInputsMultiple(this.labelContextGenerator, this.labelComponent);
}
