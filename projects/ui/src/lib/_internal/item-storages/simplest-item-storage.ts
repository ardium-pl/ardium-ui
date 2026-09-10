import { Signal, computed, signal } from '@angular/core';
import { arraySignal } from '@ardium-pl/devkit';
import { resolvePath } from 'resolve-object-path';
import { any, isDefined, isPrimitive } from 'simple-bool';
import { ArdSimplestStorageItem } from '../../types/item-storage.types';
import { Nullable } from '../../types/utility.types';

export interface SimplestItemStorageHostDefaults {
  suggValueFrom: string;
  suggLabelFrom: string;
}
export interface SimplestItemStorageHost {
  readonly valueFrom: Signal<Nullable<string>>;
  readonly labelFrom: Signal<Nullable<string>>;
  readonly DEFAULTS: SimplestItemStorageHostDefaults;
}

export class SimplestItemStorage {
  private readonly _items = arraySignal<ArdSimplestStorageItem>([]);
  private readonly _highlightedItem = signal<Nullable<ArdSimplestStorageItem>>(null);

  constructor(private readonly _ardParentComp: SimplestItemStorageHost) {}

  /**
   * Gets all items.
   */
  readonly items = this._items.asReadonly();
  /**
   * The currently highlighted item.
   */
  readonly highlightedItem = this._highlightedItem.asReadonly();
  /**
   * True if at least one item is highlighted, otherwise false.
   */
  readonly isAnyItemHighlighted = computed(() => isDefined(this._highlightedItem()));

  /**
   * Sets the component's items. Takes into account the values defined by the parent component for `suggValueFrom` and `suggLabelFrom`.
   * @param items An array of items to be set as the component's items.
   * @returns true if at least one of the items is of primitive type, otherwise false.
   */
  setItems(items: any[]): void {
    let areItemsPrimitive = false;
    if (any(items, isPrimitive)) {
      items = items.map(this._primitiveItemsMapFn);
      areItemsPrimitive = true;
    }

    this._items.set(
      items.map((item, index) => {
        return this._setItemsMapFn(item, index, areItemsPrimitive);
      })
    );
  }
  private _primitiveItemsMapFn<T>(item: T): { value: T } {
    return { value: item };
  }
  private _setItemsMapFn(rawItemData: any, index: number, areItemsPrimitive: boolean): ArdSimplestStorageItem {
    if (areItemsPrimitive) {
      return {
        itemData: rawItemData,
        index: index,
        value: rawItemData.value,
        label: rawItemData.value?.toString?.() ?? String(rawItemData.value),
        selected: false,
        highlighted: false,
      };
    }
    //get value
    const valuePath =
      this._ardParentComp.valueFrom() ?? this._ardParentComp.labelFrom() ?? this._ardParentComp.DEFAULTS.suggValueFrom;
    const value = resolvePath(rawItemData, valuePath);

    //get label
    const labelPath =
      this._ardParentComp.labelFrom() ?? this._ardParentComp.valueFrom() ?? this._ardParentComp.DEFAULTS.suggLabelFrom;
    const label = resolvePath(rawItemData, labelPath) ?? value;

    //return
    return {
      itemData: rawItemData,
      index: index,
      value: value,
      label: label?.toString?.() ?? String(label),
      selected: false,
      highlighted: false,
    };
  }

  /**
   * Selects the given item.
   * @param items The item to select.
   * @returns The value of the selected item.
   */
  selectItem(item: ArdSimplestStorageItem): any {
    return item.value;
  }
  selectCurrent(): any {
    const hi = this._highlightedItem();
    if (!hi) return undefined;
    return this.selectItem(hi);
  }

  /**
   * Unhighlights all currently highlighted items.
   */
  unhighlightCurrent(): void {
    const hi = this._highlightedItem();
    if (hi) {
      this._items.setAt(hi.index, {
        ...hi,
        highlighted: false,
      });
    }
    this._highlightedItem.set(null);
  }
  /**
   * Highlights a given item.
   * @param item The item to be highlighted.
   */
  highlightItem(item: ArdSimplestStorageItem): void {
    this.unhighlightCurrent();

    this._items.setAt(item.index, {
      ...item,
      highlighted: true,
    });

    this._highlightedItem.set(item);
  }
  /**
   * Unhighlights a given item.
   * @param item The item to be unhighlighted.
   */
  unhighlightItem(item: ArdSimplestStorageItem): void {
    this._items.setAt(item.index, {
      ...item,
      highlighted: false,
    });

    if (this._highlightedItem()?.index === item.index) this._highlightedItem.set(null);
  }
  /**
   * Highlights the first item out of all items.
   * @returns The highlighted item.
   */
  highlightFirstItem(): ArdSimplestStorageItem | null {
    if (!this._items().length) return null;

    this.unhighlightCurrent();

    const itemToHighlight = this._items().first();
    this.highlightItem(itemToHighlight);

    return itemToHighlight;
  }
  /**
   * Highlights the last item out of all items.
   * @returns The highlighted item.
   */
  highlightLastItem(): ArdSimplestStorageItem | null {
    if (!this._items().length) return null;

    this.unhighlightCurrent();

    const itemToHighlight = this._items().last();
    this.highlightItem(itemToHighlight);

    return itemToHighlight;
  }
  /**
   * Highlights the next non-disabled item defined by the offset amount.
   * @param offset The amount of items to offset the highlight by.
   * @returns The item highlighted.
   */
  highlightNextItem(offset: number): ArdSimplestStorageItem | null {
    const currentItem = this._highlightedItem();
    if (!currentItem) {
      return this.highlightFirstItem();
    }
    const items = this._items();
    const currentIndexInItems = items.findIndex(item => item.index === currentItem.index);

    let nextItemIndex = currentIndexInItems + offset;
    if (nextItemIndex >= items.length) {
      nextItemIndex -= items.length;
    } else if (nextItemIndex < 0) {
      nextItemIndex += items.length;
    }
    const itemToHighlight = items[nextItemIndex];

    this.highlightItem(itemToHighlight);

    return itemToHighlight;
  }
}
