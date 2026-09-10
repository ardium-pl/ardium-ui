import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    forwardRef,
    Inject,
    input,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { _SelectableListComponentBase } from '../_internal/selectable-list-component';
import { ARD_FORM_FIELD_CONTROL } from '../form-field/form-field-child.token';
import { OneAxisAlignment } from '../types/alignment.types';
import { ComponentColor } from '../types/colors.types';
import { ArdOptionSimple } from '../types/item-storage.types';
import { SimpleItemStorageHost } from './../_internal/item-storages/simple-item-storage';
import { ARD_SEGMENT_DEFAULTS, ArdSegmentDefaults } from './segment.defaults';
import { ArdSegmentOptionTemplateDirective } from './segment.directives';
import { SegmentAppearance, SegmentVariant } from './segment.types';

interface SegmentRow {
  options: ArdOptionSimple[];
  isNotFull?: boolean;
}

@Component({
  standalone: false,
  selector: 'ard-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumSegmentComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumSegmentComponent,
    },
  ],
})
export class ArdiumSegmentComponent extends _SelectableListComponentBase implements SimpleItemStorageHost, AfterContentInit {
  override readonly _componentId: string = '104';
  override readonly _componentName: string = 'segment';

  protected override readonly _DEFAULTS!: ArdSegmentDefaults;
  constructor(@Inject(ARD_SEGMENT_DEFAULTS) defaults: ArdSegmentDefaults) {
    super(defaults);
  }

  //! appearance
  readonly appearance = input<SegmentAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<SegmentVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);
  readonly align = input<OneAxisAlignment>(this._DEFAULTS.align);

  readonly iconBased = input<boolean, BooleanLike>(this._DEFAULTS.iconBased, { transform: v => coerceBooleanProperty(v) });
  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed<string>(() =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-color-${this.color()}`,
      `ard-align-${this.align()}`,
      this.iconBased() ? 'ard-icon-based' : '',
      this.compact() ? 'ard-compact' : '',
      this.itemRows().length > 1 ? 'ard-multirow' : 'ard-singlerow',
    ].join(' ')
  );

  //! coerced properties
  readonly autoFocus = input<boolean, BooleanLike>(this._DEFAULTS.autoFocus, { transform: v => coerceBooleanProperty(v) });
  readonly uniformWidths = input<boolean, BooleanLike>(this._DEFAULTS.uniformWidths, { transform: v => coerceBooleanProperty(v) });

  readonly itemsPerRow = input<number, NumberLike>(this._DEFAULTS.itemsPerRow, {
    transform: v => {
      const newValue = coerceNumberProperty(v, this._DEFAULTS.itemsPerRow);
      if (newValue === 0) throw new Error(`ARD-FT1040a: Cannot set <ard-segment>'s [itemsPerRow] to 0.`);
      if (newValue < 0)
        throw new Error(`ARD-FT1040b: Cannot set <ard-segment>'s [itemsPerRow] to a negative value, got "${newValue}".`);
      if (newValue % 1 !== 0) {
        const roundedValue = Math.round(newValue) || 1; // round to nearest int, but never round to zero
        console.warn(
          new Error(
            `ARD-WA1040c: Cannot set <ard-segment>'s [itemsPerRow] to a non-interger value, got "${newValue}". The value was rounded to "${roundedValue}".`
          )
        );
        return Math.ceil(newValue);
      }
      return newValue;
    },
  });
  get itemsInActualRow(): number {
    return this.itemsPerRow() === Infinity ? this.items.length : this.itemsPerRow();
  }

  //! option template
  readonly optionTemplate = contentChild(ArdSegmentOptionTemplateDirective);

  //! lifecycle hooks
  ngAfterContentInit(): void {
    if (this.autoFocus() && !this.disabled() && !this.readonly()) {
      this.focus();
    }
  }

  //! item row getters
  readonly itemRows = computed<SegmentRow[]>(() => {
    const itemRows: SegmentRow[] = [];
    let currentRow: ArdOptionSimple[] = [];
    //get all rows
    for (const item of this.items) {
      //add item
      currentRow.push(item);

      //push if item amount reached the limit
      if (this.itemsPerRow() && currentRow.length === this.itemsPerRow()) {
        itemRows.push({ options: currentRow });
        currentRow = [];
      }
    }
    //push the last row if it is not empty
    if (currentRow.length !== 0) {
      itemRows.push({
        options: currentRow,
        isNotFull: Boolean(this.itemsPerRow()),
      });
    }
    return itemRows;
  });

  //! focus handler override
  override onFocus(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    super.onFocus(event);

    if (this.itemStorage.isAnyItemHighlighted()) return;

    this.itemStorage.highlightFirstItem();
  }

  override onBlur(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    super.onBlur(event);

    this.itemStorage.unhighlightAll();
  }
}
