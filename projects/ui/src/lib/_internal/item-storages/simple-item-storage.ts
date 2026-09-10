import { Signal, computed } from '@angular/core';
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
  readonly valueFrom: Signal<Nullable<string>>;
  readonly labelFrom: Signal<Nullable<string>>;
  readonly disabledFrom: Signal<Nullable<string>>;
  readonly invertDisabled: Signal<boolean>;
  readonly DEFAULTS: ItemStorageHostDefaults;
  readonly compareWith: Signal<Nullable<CompareWithFn>>;
  readonly multiselectable: Signal<boolean>;
  readonly isValueRequired: Signal<boolean>;
  readonly maxSelectedItems: Signal<Nullable<number>>;
  readonly _componentId: string;
  readonly _componentName: string;
}

export class SimpleItemStorage {
  private readonly _items = arraySignal<ArdOptionSimple>([]);

  constructor(private readonly _ardParentComp: SimpleItemStorageHost) {}

  /**
   * Gets all items.
   */
  readonly items = computed<ArdOptionSimple[]>(() => [...this._items()]);
  /**
   * Gets all currently selected items.
   */
  readonly selectedItems = computed<ArdOptionSimple[]>(() => this.items().filter(item => item.selected));
  /**
   * Gets all currently highlighted items.
   */
  readonly highlightedItems = computed<ArdOptionSimple[]>(() => this.items().filter(item => item.highlighted));
  /**
   * Gets the values of the currently selected items.
   */
  readonly value = computed(() => this._itemsToValue(this.selectedItems()));
  /**
   * Maps an array of items into their values.
   * @param items The items to convert to value.
   * @returns An array of item values.
   */
  private _itemsToValue(items: ArdOptionSimple[]): any[] {
    return items.map(item => item.value);
  }

  private _updateItems(updateFn: (item: ArdOptionSimple) => ArdOptionSimple): void {
    this._items.map(updateFn);
  }
  private _updateItemsFromArray(updateFn: (item: ArdOptionSimple) => ArdOptionSimple, itemsToUpdate: ArdOptionSimple[]): void {
    this._items.update(items => {
      for (const itemToUpdate of itemsToUpdate) {
        const item = items[itemToUpdate.index];
        if (item) {
          items[itemToUpdate.index] = updateFn(item);
        }
      }
      return items;
    });
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
    this.items().filter(item => !item.disabled && (this.isItemLimitReached() ? item.selected : true))
  );

  readonly itemsLeftUntilLimit = computed(() =>
    this._ardParentComp.multiselectable() && isDefined(this._ardParentComp.maxSelectedItems())
      ? this._ardParentComp.maxSelectedItems()! - this.selectedItems().length
      : 1
  );
  /**
   * Returns true if the parent component defines the limit of concurrently selectable items and the amount of currently selected items matches that limit. Otherwise returns false.
   *
   * **TLDR**: true if `maxSelectedItems` is defined and the number of selected items matches that value.
   */
  readonly isItemLimitReached = computed(() => this.itemsLeftUntilLimit() <= 0);

  private _areItemsInitialized = false;
  /**
   * Sets the component's items. Takes into account the values defined by the parent component for `valueFrom`, `labelFrom`, and `disabledFrom`.
   * @param items An array of items to be set as the component's items.
   * @returns true if at least one of the items is of primitive type, otherwise false.
   */
  setItems(items: unknown[]): void {
    this._areItemsInitialized = true;
    let areItemsPrimitive = false;
    if (items.some(isPrimitive)) {
      items = items.map(this._primitiveItemsMapFn);
      areItemsPrimitive = true;
    }

    this._items.set(
      items.map((item, index) => {
        return this._setItemsMapFn(item, index, areItemsPrimitive);
      })
    );
    if (this._valueBeforeItemsSet !== null) {
      this.writeValue(this._valueBeforeItemsSet);
      this._valueBeforeItemsSet = null;
    }
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


  private _valueBeforeItemsSet: any = null;
  /**
   * Writes a new value to the item storage. Selects the correct items based on the provided values, warning the user if the value is not found.
   * @param ngModel The value of the ngModel to set.
   */
  writeValue(ngModel: any): void {
    if (!this._areItemsInitialized) {
      this._valueBeforeItemsSet = ngModel;
      return;
    }
    this._forceUnselectAll();

    if (!this._validateWriteValue(ngModel)) return;

    const selectItemByValue = (value: any) => {
      if (value === null || value === undefined) {
        this.unselectAll();
        return;
      }
      const item = this.findItemByValue(value);

      if (item) {
        this.selectItem(item);
        return;
      }
      console.warn(
        `ARD-WA${this._ardParentComp._componentId}3: Couldn't find an item with value ${value?.toString?.() || String(value)}.`
      );
    };

    if (this._ardParentComp.multiselectable()) {
      for (const modelValue of ngModel) {
        selectItemByValue(modelValue);
      }
    } else {
      selectItemByValue(ngModel);
    }
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
        `ARD-FT${this._ardParentComp._componentId}2: Setting object ${jsonItemString} as your value with [valueFrom] is not allowed unless [compareWith] is used.`
      );
      return false;
    }
    return true;
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
  private _validateWriteValue(ngModel: unknown): boolean {
    if (this._ardParentComp.multiselectable()) {
      if (!isArray(ngModel)) {
        throw new Error(
          `ARD-FT${this._ardParentComp._componentId}0m: a multiselectable <ard-${this._ardParentComp._componentName}> expects its value to be an array, got "${ngModel}".`
        );
      }
      return ngModel.every(v => this._validateSingleElementType(v));
    }
    return this._validateSingleElementType(ngModel);
  }

  findItemByValue(valueToFind: any): ArdOptionSimple | undefined {
    let findBy: (item: ArdOptionSimple) => boolean;
    const cmpFn = this._ardParentComp.compareWith();
    if (isDefined(cmpFn)) {
      findBy = item => cmpFn(valueToFind, item.value);
    } else {
      findBy = item => item.value === valueToFind;
    }
    return this.items().find(item => findBy(item));
  }

  /**
   * Unselects all selected items.
   *
   * If the parent component requires at least one value to be selected at all times, the first selected items is left selected.
   * @returns An array of items cleared, mapped to only their values.
   */
  unselectAll(): any[] {
    return this.unselectItem(...this.selectedItems());
  }
  /**
   * Unselects all selected items, no matter what the component settings are.
   * @returns An array of items cleared, mapped to only their values.
   */
  private _forceUnselectAll(): any[] {
    const ret = this.value();

    this._updateItems(item => ({ ...item, selected: false }));

    return ret;
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
    const newItemsArray = [...this.items()];
    for (const item of items) {
      itemsSelectedCount++;
      if (item.selected) continue;
      if (itemsSelectedCount > itemsLeftUntilLimit) {
        break;
      }
      newItemsArray[item.index] = { ...item, selected: true };
    }

    const itemsUnselected = this._ardParentComp.multiselectable()
      ? []
      : this.selectedItems().filter(item => !items.find(v => v.value === item.value));
    
    for (const item of itemsUnselected) {
      newItemsArray[item.index] = { ...item, selected: false };
    }
    
    const itemsSelected = items.slice(0, itemsSelectedCount);
    const itemsFailedToSelect = items.slice(itemsSelectedCount);

    const isAnyNewItemToBeSelected = !!itemsSelected.find(item => !this.selectedItems().find(v => v.value === item.value));

    if (isAnyNewItemToBeSelected) {
      this._items.set(newItemsArray);
    }

    return [this._itemsToValue(itemsSelected), this._itemsToValue(itemsUnselected), this._itemsToValue(itemsFailedToSelect)];
  }
  /**
   *
   * @param items A rest operator array of item objects to be unselected.
   * @returns An array of items unselected, mapped to only their values.
   */
  unselectItem(...items: ArdOptionSimple[]): any[] {
    let shouldKeepFirstSelected = this._ardParentComp.isValueRequired();

    const unselectedItems: ArdOptionSimple[] = [];
    this._updateItemsFromArray(item => {
      if (item.selected && shouldKeepFirstSelected) {
        shouldKeepFirstSelected = false;
        return item;
      }
      if (item.selected) {
        unselectedItems.push(item);
      }
      return {
        ...item,
        selected: false,
      };
    }, items);

    return this._itemsToValue(unselectedItems);
  }

  /**
   * Unhighlights all currently highlighted items.
   */
  unhighlightAll(): void {
    this._updateItems(item => ({ ...item, highlighted: false }));
  }
  /**
   * Highlights the given item, while unhighlighting all other items. Does nothing when the item is disabled.
   * @param item The item to be highlighted.
   * @returns The highlighted item.
   */
  highlightSingleItem(item: ArdOptionSimple): ArdOptionSimple | null {
    if (!item || item.disabled) return null;
    this.unhighlightAll();
    return this.highlightItem(item);
  }
  /**
   * Highlights all given items.
   * @param items A rest operator array of items to be highlighted.
   * @returns The last highlighted item.
   */
  highlightItem(...items: ArdOptionSimple[]): ArdOptionSimple {
    this._updateItemsFromArray(item => ({ ...item, highlighted: true }), items);
    return items.last();
  }
  /**
   * Unhighlights all given items.
   * @param items A rest operator array of items to be unhighlighted.
   */
  unhighlightItem(...items: ArdOptionSimple[]): void {
    this._updateItemsFromArray(item => ({ ...item, highlighted: false }), items);
  }
  /**
   * Highlights the first item out of all items.
   * @returns The highlighted item.
   */
  highlightFirstItem(): ArdOptionSimple | null {
    this.unhighlightAll();

    const itemToHighlight = this._highlightableItems().first();
    return this.highlightItem(itemToHighlight);
  }
  /**
   * Highlights the last item out of all items.
   * @returns The highlighted item.
   */
  highlightLastItem(): ArdOptionSimple | null {
    this.unhighlightAll();

    const itemToHighlight = this._highlightableItems().last();
    return this.highlightItem(itemToHighlight);
  }
  /**
   * Highlights all non-disabled items.
   */
  highlightAllItems(): void {
    const itemsToHighlight = this._highlightableItems();

    this.highlightItem(...itemsToHighlight);
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
    const itemsWithoutDisabled = this._items().filter(item => !item.disabled && (!this.isItemLimitReached() || item.selected));
    const currentIndexInItems = itemsWithoutDisabled.findIndex(item => item.index === currentItem.index);

    let nextItemIndex = currentIndexInItems + offset;
    if (nextItemIndex >= itemsWithoutDisabled.length) {
      nextItemIndex -= itemsWithoutDisabled.length;
    }
    if (nextItemIndex < 0) {
      nextItemIndex += itemsWithoutDisabled.length;
    }
    const itemToHighlight = itemsWithoutDisabled[nextItemIndex];

    if (hasShift && this._ardParentComp.multiselectable()) {
      if (itemToHighlight.highlighted) {
        this.unhighlightItem(currentItem);
      }
      return this.highlightItem(itemToHighlight);
    }
    return this.highlightSingleItem(itemToHighlight);
  }
}
