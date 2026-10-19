import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { arraySignal } from '@ardium-pl/devkit';
import { resolvePath } from 'resolve-object-path';
import { evaluate, isArray, isDefined, isObject, isPrimitive } from 'simple-bool';
import { ArdOptionSimple, CompareWithFn } from '../../types/item-storage.types';
import { Nullable } from '../../types/utility.types';

export interface ItemStorageHostDefaults {
  valueFrom: string;
  labelFrom: string;
  disabledFrom: string;
}
export interface SimpleItemStorageHost {
  readonly value: WritableSignal<unknown[] | unknown>;
  readonly valueFrom: Signal<Nullable<string>>;
  readonly labelFrom: Signal<Nullable<string>>;
  readonly disabledFrom: Signal<Nullable<string>>;
  readonly invertDisabled: Signal<boolean>;
  readonly DEFAULTS: ItemStorageHostDefaults;
  readonly compareWith: Signal<Nullable<CompareWithFn>>;
  readonly multiselectable: Signal<boolean>;
  readonly isValueRequired: Signal<boolean>;
  readonly maxLength: Signal<Nullable<number>>;
  readonly _componentId: string;
  readonly _componentName: string;
}

export class SimpleItemStorage {
  private readonly _options = arraySignal<ArdOptionSimple>([]);

  constructor(private readonly _ardParentComp: SimpleItemStorageHost) {}

  private readonly _valueAsArray = computed<any[]>(() => {
    const value = this._ardParentComp.value();
    if (!isDefined(value)) return [];
    return isArray(value) ? value : [value];
  });

  private _setValue(newValue: any[]): void {
    if (this._ardParentComp.multiselectable()) {
      this._ardParentComp.value.set(newValue);
    } else {
      this._ardParentComp.value.set(newValue[0]);
    }
  }
  private _addItemsToValue(items: any[]): void {
    const newValue = this._ardParentComp.multiselectable() ? [...this._valueAsArray(), ...items] : items;
    this._setValue(newValue);
  }

  private readonly _highlightedItems = arraySignal<ArdOptionSimple>([]);

  validateAllSelectedItemsExist(): void {
    if (!this._areItemsInitialized()) return;

    const validValues: any[] = [];
    for (const item of this._valueAsArray()) {
      if (!this._options().some(i => this.itemHasValueOf(i, item))) {
        const valueAsString = typeof item === 'string' ? `"${item}"` : item?.toString?.() || String(item);
        console.warn(
          `ARD-WA${this._ardParentComp._componentId}3: Couldn't find an item with value ${valueAsString}. Value will be ignored.`
        );
      } else {
        validValues.push(item);
      }
    }
    if (validValues.length !== this._valueAsArray().length) {
      this._setValue(validValues);
    }
  }

  /**
   * Gets all items.
   */
  readonly options = computed<ArdOptionSimple[]>(() =>
    this._options().map(item => ({
      ...item,
      selected: this._valueAsArray().some(v => this.itemHasValueOf(item, v)),
      highlighted: this._highlightedItems().some(v => this.itemHasValueOf(item, v)),
    }))
  );
  /**
   * Gets all currently selected items.
   */
  readonly selectedItems = computed<ArdOptionSimple[]>(() => this.options().filter(item => item.selected));
  /**
   * Gets all currently highlighted items.
   */
  readonly highlightedItems = computed<ArdOptionSimple[]>(() => this.options().filter(item => item.highlighted));

  readonly value = this._ardParentComp.value; // TODO remove
  /**
   * Maps an array of items into their values.
   * @param items The items to convert to value.
   * @returns An array of item values.
   */
  private _itemsToValue(items: ArdOptionSimple[]): any[] {
    return items.map(item => item.value);
  }

  /**
   * Returns true if at least one item is highlighted, otherwise false.
   */
  readonly isAnyItemHighlighted = computed(() => this.highlightedItems().length > 0);
  /**
   * Finds all highlightable items. An item is considered highlightable if it is **not** disabled.
   * @returns An array of all highlightable items.
   */
  private readonly _highlightableItems = computed(() =>
    this.options().filter(item => !item.disabled && (this.isItemLimitReached() ? item.selected : true))
  );

  readonly itemsLeftUntilLimit = computed(() =>
    this._ardParentComp.multiselectable() && isDefined(this._ardParentComp.maxLength())
      ? this._ardParentComp.maxLength()! - this._valueAsArray().length
      : 1
  );
  /**
   * Returns true if the parent component defines the limit of concurrently selectable items and the amount of currently selected items matches that limit. Otherwise returns false.
   *
   * **TLDR**: true if `maxLength` is defined and the number of selected items matches that value.
   */
  readonly isItemLimitReached = computed(() => this.itemsLeftUntilLimit() <= 0);

  private readonly _areItemsInitialized = signal<boolean>(false);
  /**
   * Sets the component's items. Takes into account the values defined by the parent component for `valueFrom`, `labelFrom`, and `disabledFrom`.
   * @param items An array of items to be set as the component's items.
   * @returns true if at least one of the items is of primitive type, otherwise false.
   */
  setItems(items: unknown[]): void {
    this._areItemsInitialized.set(true);
    let areItemsPrimitive = false;
    if (items.some(isPrimitive)) {
      items = items.map(this._primitiveItemsMapFn);
      areItemsPrimitive = true;
    }

    this._options.set(
      items.map((item, index) => {
        return this._setItemsMapFn(item, index, areItemsPrimitive);
      })
    );
  }
  private _primitiveItemsMapFn<T>(item: T): { value: T } {
    return { value: item };
  }
  private _setItemsMapFn(rawItemData: any, index: number, areItemsPrimitive: boolean): ArdOptionSimple {
    if (areItemsPrimitive) {
      return {
        itemData: rawItemData,
        index: index,
        value: rawItemData.value,
        label: rawItemData.value?.toString?.() ?? String(rawItemData.value),
        disabled: false,
        selected: false,
        highlighted: false,
      };
    }
    //get value
    const valuePath =
      this._ardParentComp.valueFrom() ?? this._ardParentComp.labelFrom() ?? this._ardParentComp.DEFAULTS.valueFrom;
    const value = resolvePath(rawItemData, valuePath);

    //get label
    const labelPath =
      this._ardParentComp.labelFrom() ?? this._ardParentComp.valueFrom() ?? this._ardParentComp.DEFAULTS.labelFrom;
    const label = resolvePath(rawItemData, labelPath) ?? value;

    //get disabled
    const disabledPath = this._ardParentComp.disabledFrom() ?? this._ardParentComp.DEFAULTS.disabledFrom;
    let disabled = evaluate(resolvePath(rawItemData, disabledPath));
    if (this._ardParentComp.invertDisabled()) {
      disabled = !disabled;
    }

    //return
    return {
      itemData: rawItemData,
      index: index,
      value: value,
      label: label?.toString?.() ?? String(label),
      disabled: disabled,
      selected: false,
      highlighted: false,
    };
  }

  /**
   * Validates that all values of the value to be written are able to be accurately compared against the storage items.
   *
   * An item from the ngModel array is considered valid if it is a primitive value, or if all of the below points are met:
   * 1. The parent component defines the `compareWith` property.
   * 2. The ngModel value item is an object (or array).
   * 3. The parent component has a defined `valueFrom` property.
   * @param ngModel The value of ngModel to validate.
   * @returns true if all items are valid, otherwise false.
   */
  validateWrittenValue(ngModel: unknown) {
    if (!isDefined(ngModel)) return;
    if (this._ardParentComp.multiselectable()) {
      if (!isArray(ngModel)) {
        throw new Error(
          `ARD-FT${this._ardParentComp._componentId}0m: a multiselectable <ard-${this._ardParentComp._componentName}> expects its value to be an array, got "${ngModel}".`
        );
      }
      ngModel.forEach(v => this._validateSingleElementType(v));
      return;
    }
    this._validateSingleElementType(ngModel);
  }
  private _validateSingleElementType(item: unknown): boolean {
    if (!isDefined(this._ardParentComp.compareWith()) && isObject(item) && this._ardParentComp.valueFrom()) {
      if (!this._ardParentComp.multiselectable() && Array.isArray(item)) {
        console.error(
          `ARD-FT${this._ardParentComp._componentId}0s: a non-multiselectable <ard-${this._ardParentComp._componentName}> expects its value not to be an array, got "[${item}]". If the value is supposed to be an array, use [compareWith].`
        );
        return false;
      }

      let jsonItemString = `${item}`;
      try {
        jsonItemString = JSON.stringify(item);
      } catch (error) {
        /* ignore */
      }

      console.error(
        `ARD-FT${this._ardParentComp._componentId}2: Setting object ${jsonItemString} as your value is not allowed unless [compareWith] is used.`
      );
      return false;
    }
    return true;
  }

  itemHasValueOf(option: ArdOptionSimple, valueToCompare: any): boolean {
    let findBy: (item: ArdOptionSimple) => boolean;
    const cmpFn = this._ardParentComp.compareWith();
    if (isDefined(cmpFn)) {
      findBy = item => cmpFn(valueToCompare, item.value);
    } else {
      findBy = item => item.value === valueToCompare;
    }
    return findBy(option);
  }

  /**
   * Unselects all selected items.
   *
   * If the parent component requires at least one value to be selected at all times, the first selected items is left selected.
   * @returns An array of items cleared, mapped to only their values.
   */
  unselectAll(): any[] {
    const value = this._valueAsArray();
    const shouldKeepFirstSelected = this._ardParentComp.isValueRequired();

    if (shouldKeepFirstSelected) {
      if (value.length <= 1) return [];

      const newValue = value.slice(1);
      this._ardParentComp.value.set(newValue);
      return newValue;
    }
    return value;
  }
  /**
   * Selects one or multiple items.
   *
   * Accounts for the limit of concurrently selected items defined by the parent component.
   * @param items A rest operator array of item objects to be selected.
   * @returns A tuple containing three arrays, all mapped to only their values:
   * - An array of items selected,
   * - An array of items unselected,
   * - An array of items failed to select due to the limit.
   */
  selectItem(...items: ArdOptionSimple[]): [any[], any[], any[]] {
    if (this.isItemLimitReached()) {
      return [[], [], this._itemsToValue(items)];
    }

    const itemsLeftUntilLimit = this.itemsLeftUntilLimit();
    let itemsSelectedCount = 0;
    const itemsToAdd = new Set<any>();
    const itemsSelected: any[] = [];

    console.log('itemsLeftUntilLimit', itemsLeftUntilLimit);

    for (const item of items) {
      if (item.selected) continue;
      itemsSelectedCount++;
      if (itemsSelectedCount > itemsLeftUntilLimit) {
        break;
      }
      itemsSelected.push(item);
      itemsToAdd.add(item.value);
    }
    const itemsFailedToSelect = items.slice(itemsSelectedCount);

    const itemsUnselected = this._ardParentComp.multiselectable() ? [] : this._valueAsArray();

    if (itemsSelected.length > 0) {
      this._addItemsToValue([...itemsToAdd]);
    }
    return [itemsSelected, itemsUnselected, this._itemsToValue(itemsFailedToSelect)];
  }
  /**
   *
   * @param items A rest operator array of item objects to be unselected.
   * @returns An array of items unselected, mapped to only their values.
   */
  unselectItem(...items: ArdOptionSimple[]): any[] {
    const shouldKeepFirstSelected = this._ardParentComp.isValueRequired();

    const unselectedItems: any[] = [];

    let wasFirstItemKept = false;
    const newValue = this._valueAsArray().filter(item => {
      if (items.some(i => this.itemHasValueOf(i, item))) {
        if (shouldKeepFirstSelected && !wasFirstItemKept) {
          wasFirstItemKept = true;
          return true;
        }
        unselectedItems.push(item);
        return false;
      }
      return true;
    });
    this._setValue(newValue);

    return unselectedItems;
  }

  /**
   * Unhighlights all currently highlighted items.
   */
  unhighlightAll(): void {
    this._highlightedItems.set([]);
  }
  /**
   * Highlights the given item, while unhighlighting all other items. Does nothing when the item is disabled.
   * @param item The item to be highlighted.
   * @returns The highlighted item.
   */
  highlightSingleItem(item: ArdOptionSimple): ArdOptionSimple | null {
    if (!item || item.disabled) return null;

    this._highlightedItems.set([item]);

    return item;
  }
  /**
   * Highlights all given items.
   * @param items A rest operator array of items to be highlighted.
   * @returns The last highlighted item.
   */
  highlightItem(...items: ArdOptionSimple[]): ArdOptionSimple {
    for (const item of items) {
      if (item.disabled) continue;
      this._highlightedItems.push(item);
    }
    return items.last();
  }
  /**
   * Unhighlights all given items.
   * @param items A rest operator array of items to be unhighlighted.
   */
  unhighlightItem(...items: ArdOptionSimple[]): void {
    for (const item of items) {
      this._highlightedItems.filter(v => this.itemHasValueOf(item, v.value));
    }
  }
  /**
   * Highlights the first item out of all items.
   * @returns The highlighted item.
   */
  highlightFirstItem(): ArdOptionSimple | null {
    const itemToHighlight = this._highlightableItems().first();
    if (!itemToHighlight) return null;

    this._highlightedItems.set([itemToHighlight]);
    return itemToHighlight;
  }
  /**
   * Highlights the last item out of all items.
   * @returns The highlighted item.
   */
  highlightLastItem(): ArdOptionSimple | null {
    const itemToHighlight = this._highlightableItems().last();
    if (!itemToHighlight) return null;

    this._highlightedItems.set([itemToHighlight]);
    return itemToHighlight;
  }
  /**
   * Highlights all non-disabled items.
   */
  highlightAllItems(): void {
    this._highlightedItems.set([...this._highlightableItems()]);
  }
  /**
   * Highlights the next non-disabled item defined by the offset amount.
   *
   * If `hasShift` is set to true, all originally highlighted items are kept. Otherwise, all original items are unselected.
   * @param offset The amount of items to offset the highlight by.
   * @param hasShift Whether the user has the shift key pressed.
   * @returns The item highlighted.
   */
  highlightNextItem(offset: number, hasShift?: boolean): ArdOptionSimple | null {
    if (!this.isAnyItemHighlighted()) {
      return this.highlightFirstItem();
    }
    const currentItem = this.highlightedItems().last();
    const highlightableItems = this._highlightableItems();
    const currentIndexInItems = highlightableItems.findIndex(item => item.index === currentItem.index);

    let nextItemIndex = currentIndexInItems + offset;
    if (nextItemIndex >= highlightableItems.length) {
      nextItemIndex -= highlightableItems.length;
    }
    if (nextItemIndex < 0) {
      nextItemIndex += highlightableItems.length;
    }
    const itemToHighlight = highlightableItems[nextItemIndex];

    if (hasShift && this._ardParentComp.multiselectable()) {
      if (itemToHighlight.highlighted) {
        this.unhighlightItem(currentItem);
      } else {
        return this.highlightItem(itemToHighlight);
      }
      return itemToHighlight;
    }
    return this.highlightSingleItem(itemToHighlight);
  }
}
