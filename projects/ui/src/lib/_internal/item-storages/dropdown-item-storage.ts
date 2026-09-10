import { computed, Signal, signal } from '@angular/core';
import { arraySignal } from '@ardium-pl/devkit';
import { resolvePath } from 'resolve-object-path';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { any, evaluate, isArray, isDefined, isObject, isPrimitive, isPromise } from 'simple-bool';
import { AddCustomFn } from '../../select/select.types';
import { ArdItemGroupMap, ArdOption, ArdOptionGroup, CompareWithFn, GroupByFn, SearchFn } from '../../types/item-storage.types';
import { Nullable } from '../../types/utility.types';

export interface ItemStorageHost {
  readonly valueFrom: Signal<string>;
  readonly labelFrom: Signal<string>;
  readonly disabledFrom: Signal<string>;
  readonly invertDisabled: Signal<boolean>;
  readonly groupLabelFrom: Signal<string | GroupByFn>;
  readonly groupDisabledFrom: Signal<string>;
  readonly childrenFrom: Signal<string>;
  readonly itemsAlreadyGrouped: Signal<Nullable<boolean>>;
  readonly hideSelected: Signal<boolean>;
  readonly deferValueWrites: Signal<boolean>;
  readonly searchCaseSensitive: Signal<boolean>;
  readonly searchFn: Signal<SearchFn | null>;
  readonly compareWith: Signal<Nullable<CompareWithFn>>;
  readonly multiselectable: Signal<boolean>;
  readonly maxSelectedItems: Signal<Nullable<number>>;
  readonly addCustom: Signal<boolean | AddCustomFn<any> | AddCustomFn<Promise<any>>>;
  readonly _componentId: string;
}

export class ItemStorage {
  private readonly _items = arraySignal<ArdOption>([]);

  readonly filteredItems = computed<ArdOption[]>(() => this.items().filter(item => item.filtered), {
    equal: arrayEqualityFn,
  });
  readonly selectedItems = computed<ArdOption[]>(() => this.items().filter(item => item.selected), {
    equal: arrayEqualityFn,
  });
  readonly highlightedItems = computed<ArdOption[]>(() => this.items().filter(item => item.highlighted), {
    equal: arrayEqualityFn,
  });
  private readonly _lastHighlightedItem = signal<Nullable<ArdOption>>(undefined);
  private readonly _recentlyHighlightedItem = signal<Nullable<ArdOption>>(undefined);

  private readonly _groups = computed<ArdItemGroupMap>(() => {
    const groupMap: ArdItemGroupMap = this._createEmptyGroupMap();
    for (const item of this.filteredItems()) {
      if (this._ardParentComp.hideSelected() && item.selected) continue;

      let group = groupMap.get(item.group);
      if (!group) {
        group = {
          label: item.group?.toString?.() ?? String(item.group),
          children: [],
          disabled: false,
        };
        groupMap.set(item.group, group);
      }
      group.children.push(item);
    }
    return groupMap;
  });

  private _updateItems(updateFn: (item: ArdOption) => ArdOption): void {
    this._items.map(updateFn);
  }
  private _updateItemsFromArray(updateFn: (item: ArdOption) => ArdOption, itemsToUpdate: ArdOption[]): void {
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

  constructor(private readonly _ardParentComp: ItemStorageHost) {}

  readonly groups = computed(() =>
    Array.from(this._groups().entries())
      .map(([, group]) => group)
      .filter(group => group.children.length)
  );
  readonly items = computed(() => [...this._items()]);

  readonly lastSelectedItem = computed(() => this.selectedItems().last(1, item => !item.disabled));

  readonly value = computed(() => this._itemsToValue(this.selectedItems()));
  private _itemsToValue(items: ArdOption[]): any[] {
    return items.map(item => item.value);
  }

  readonly isNoItemsToSelect = computed(() => this.items().length === this.selectedItems().length);
  readonly isNoItemsFound = computed(() => this.filteredItems().length === 0);
  readonly isAnyItemExactMatch = computed(() => this.filteredItems().some(item => item.isExactMatch));
  readonly isAnyItemSelected = computed(() => this.selectedItems().length > 0);
  readonly isAnyItemHighlighted = computed(() => this.highlightedItems().length > 0);
  readonly itemsLeftUntilLimit = computed(() =>
    this._ardParentComp.multiselectable() && isDefined(this._ardParentComp.maxSelectedItems())
      ? this._ardParentComp.maxSelectedItems()! - this.selectedItems().length
      : 1
  );
  readonly isItemLimitReached = computed(() => this.itemsLeftUntilLimit() <= 0);
  private readonly _highlightableItems = computed(() =>
    this.filteredItems().filter(
      item =>
        !item.disabled && (this._ardParentComp.hideSelected() ? !item.selected : this.isItemLimitReached() ? item.selected : true)
    )
  );

  setItems(items: any[]): void {
    let areItemsPrimitive = false;
    if (this._ardParentComp.groupLabelFrom() && this._ardParentComp.itemsAlreadyGrouped()) {
      const newItems = [];
      for (const group of items) {
        let children: any[];
        [children, areItemsPrimitive] = this._ungroupAlreadyGroupedItems(group);
        newItems.push(...children);
      }
      items = newItems;
    }
    if (any(items, isPrimitive)) {
      items = items.map(this._primitiveItemsMapFn);
      areItemsPrimitive = true;
    }

    this._items.set(
      items.map((item, index) => {
        return this._setItemsMapFn(item, index, areItemsPrimitive);
      })
    );
    // write value if it was deferred
    if (isDefined(this._valueToWriteAfterItemsLoad)) {
      this.handleWriteValue(this._valueToWriteAfterItemsLoad);
    }
  }
  updateItemFromOptionComponent(itemValue: any, updatedItem: Partial<ArdOption>): void {
    const item = this.findItemByValue(itemValue);
    if (!item) return;
    const index = item.index;
    this._items.setAt(index, { ...item, ...updatedItem });
  }
  private _addSingleItem(item: any): ArdOption {
    const isItemPrimitive = isPrimitive(item);
    //map a primitive item to a usable object
    if (isItemPrimitive) {
      item = this._primitiveItemsMapFn(item);
    }
    //map the item to create data bindings
    const ardOption = this._setItemsMapFn(item, (this.items().last()?.index ?? -1) + 1, isItemPrimitive);

    //push the item into all items
    this._items.push(ardOption);

    //add all items to filter array
    this._updateItems(item => ({ ...item, filtered: true }));

    return ardOption;
  }
  private _primitiveItemsMapFn<T>(item: T): { value: T } {
    return { value: item };
  }
  private _ungroupAlreadyGroupedItems<T extends object>(group: T): [any[], boolean] {
    //determine groupBy (groupLabel) path
    const groupBy = this._ardParentComp.groupLabelFrom();

    //get group label from object
    let groupName: any;
    if (typeof groupBy === 'string') {
      groupName = resolvePath(group, groupBy);
    } else {
      groupName = groupBy(group);
    }

    //determine group children path
    const childrenPath = this._ardParentComp.childrenFrom();

    //get group children
    let groupItems: any = resolvePath(group, childrenPath);

    //return empty array if groupItems is not an array or is empty
    if (!isArray(groupItems) || groupItems.length === 0) return [[], false];

    //check if the array is an array of primitives, and map it if needed
    const areItemsPrimitive = false;
    if (any(groupItems, isPrimitive)) {
      groupItems = groupItems.map(this._primitiveItemsMapFn);
    }
    //add group name to every child
    groupItems = groupItems.map((item: any) => {
      item.$ardgroup = groupName;
      return item;
    });

    return [groupItems, areItemsPrimitive];
  }
  private _setItemsMapFn(rawItemData: any, index: number, areItemsPrimitive: boolean): ArdOption {
    if (areItemsPrimitive) {
      return {
        itemData: rawItemData,
        index: index,
        value: rawItemData.value,
        label: rawItemData.value?.toString?.() ?? String(rawItemData.value),
        disabled: false,
        filtered: true,
        isExactMatch: false,
        selected: false,
        highlighted: false,
        group: undefined,
        highlighted_recently: false,
      };
    }
    //get value
    const valuePath = this._ardParentComp.valueFrom() ?? this._ardParentComp.labelFrom();
    const value = resolvePath(rawItemData, valuePath);

    //get label
    const labelPath = this._ardParentComp.labelFrom() ?? this._ardParentComp.valueFrom();
    const label = resolvePath(rawItemData, labelPath) ?? value;

    //get disabled
    const disabledPath = this._ardParentComp.disabledFrom();
    let disabled = evaluate(resolvePath(rawItemData, disabledPath));
    if (this._ardParentComp.invertDisabled()) {
      disabled = !disabled;
    }

    //get groups
    let group: any = undefined;
    const groupBy = this._ardParentComp.groupLabelFrom();
    if (groupBy) {
      if (rawItemData.$ardgroup) {
        group = rawItemData.$ardgroup;
      } else {
        if (typeof groupBy === 'string') {
          group = resolvePath(rawItemData, groupBy);
        } else {
          group = groupBy(rawItemData);
        }
      }
    }

    return {
      itemData: rawItemData,
      index: index,
      value: value,
      label: label?.toString?.() ?? String(label),
      disabled: disabled,
      group: group,
      filtered: true,
      isExactMatch: false,
      selected: false,
      highlighted: false,
      highlighted_recently: false,
    };
  }
  private _createEmptyGroupMap(): ArdItemGroupMap {
    return new Map([
      [
        undefined,
        {
          label: '',
          children: [],
          disabled: false,
          selected: false,
          highlighted: false,
        },
      ],
    ]) as ArdItemGroupMap;
  }
  private _isWriteValueValid(ngModel: any[]): boolean {
    return ngModel.every(item => {
      if (!isDefined(this._ardParentComp.compareWith) && isObject(item)) {
        console.warn(
          `ARD-WA${this._ardParentComp._componentId}0: [valueFrom] can only point to a property of a primitive type. Define [compareWith] if using objects as a value is needed.`
        );
        return false;
      }
      return true;
    });
  }
  private _valueToWriteAfterItemsLoad: any = null;
  async handleWriteValue(ngModel: any): Promise<void> {
    //defer writing the value if no options are yet loaded
    if (this._ardParentComp.deferValueWrites() && this._items().length === 0) {
      this._valueToWriteAfterItemsLoad = ngModel;
      return;
    }
    // if null or undefined clear selection
    if (!isDefined(ngModel)) {
      this.clearAllSelected();
      return;
    }

    // convert from single item to items array
    if (!isArray(ngModel)) {
      ngModel = [ngModel];
    }
    const ngModelArray = ngModel as any[];
    // check value validity
    if (!this._isWriteValueValid(ngModelArray)) {
      return;
    }

    const itemsToSelect = (
      await Promise.all(
        ngModelArray.map(async v => {
          const item = this.findItemByValue(v);
          if (item) {
            return item;
          }
          return new Promise<ArdOption | null>(resolve => {
            setTimeout(() => {
              const item = this.findItemByValue(v);
              if (item) {
                resolve(item);
                return;
              }
              console.warn(
                `ARD-WA${this._ardParentComp._componentId}1: Couldn't find an item with value ${
                  v?.toString?.() || String(v)
                } when trying to select it.`
              );
              resolve(null);
            }, 0);
          });
        })
      )
    ).filter(v => !!v);

    this.selectItem(...itemsToSelect);
  }
  findItemByValue(valueToFind: any): ArdOption | undefined {
    let findBy: (item: ArdOption) => boolean;
    if (this._ardParentComp.compareWith()) {
      findBy = item => this._ardParentComp.compareWith()!(valueToFind, item.value);
    } else {
      findBy = item => item.value === valueToFind;
    }
    return this.items().find(item => findBy(item));
  }
  async addCustomOption(
    value: string,
    fn: AddCustomFn<any> | AddCustomFn<Promise<any>> | AddCustomFn<Observable<any>>
  ): Promise<ArdOption | null> {
    let optionValue = fn(value);

    if (isObservable(optionValue)) {
      optionValue = await firstValueFrom(optionValue);
    } else if (isPromise(optionValue)) {
      try {
        optionValue = await optionValue;
      } catch (error) {
        console.error(
          `ARD-NF${this._ardParentComp._componentId}2: Failed to add a custom option. The promise was rejected with the following error:`,
          error
        );
        return null;
      }
    }

    const newOptionObj = this._addSingleItem(optionValue);
    return newOptionObj;
  }

  clearAllSelected(): any[] {
    const removedItemValues = this._itemsToValue(this.selectedItems());
    this._updateItems(item => ({ ...item, selected: false }));
    return removedItemValues;
  }
  clearLastSelected(): ArdOption {
    const item = this.selectedItems().last();
    if (!item) return item;
    this.unselectItem(item);
    return item;
  }

  selectItem(...items: ArdOption[]): [any[], any[], any[]] {
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
    if (!this._lastHighlightedItem()) {
      this._lastHighlightedItem.set(itemsFailedToSelect.first() || itemsSelected.last());
    }

    return [this._itemsToValue(itemsSelected), this._itemsToValue(itemsUnselected), this._itemsToValue(itemsFailedToSelect)];
  }
  unselectItem(...items: ArdOption[]): any[] {
    this._updateItemsFromArray(item => ({ ...item, selected: false }), items);

    if (!this._lastHighlightedItem()) {
      this._lastHighlightedItem.set(items.last());
    }

    return this._itemsToValue(items);
  }
  toggleItem(item: ArdOption): void {
    if (item.selected) {
      this.unselectItem(item);
      return;
    }
    this.selectItem(item);
  }

  clearAllHighlights(): void {
    this._updateItems(item => ({ ...item, highlighted: false }));
  }
  highlightGroup(group: ArdOptionGroup): ArdOption {
    const childrenIndexes = new Set(group.children.map(item => item.index));
    this._updateItems(item => ({ ...item, highlighted: childrenIndexes.has(item.index) }));
    return group.children.first();
  }
  highlightSingleItem(item: ArdOption): ArdOption | null {
    if (!item || item.disabled) return null;
    this.clearAllHighlights();
    return this.highlightItem(item);
  }
  highlightItem(...items: ArdOption[]): ArdOption {
    this._updateItemsFromArray(item => ({ ...item, highlighted: true }), items);
    this._lastHighlightedItem.set(items.last());
    return items.last();
  }
  unhighlightItem(...items: ArdOption[]): void {
    this._updateItemsFromArray(item => ({ ...item, highlighted: false }), items);
  }
  highlightFirstItem(): ArdOption | null {
    this.clearAllHighlights();
    const itemsToHighlight = this._highlightableItems();
    return this.highlightSingleItem(itemsToHighlight.first());
  }
  highlightLastItem(): ArdOption | null {
    this.clearAllHighlights();
    const itemsToHighlight = this._highlightableItems();
    return this.highlightSingleItem(itemsToHighlight.last());
  }
  highlightAllItems(): void {
    this.highlightItem(...this._highlightableItems());
  }
  setRecentlyHighlighted(itemToSet: ArdOption): void {
    this._updateItemsFromArray(item => ({ ...item, highlighted_recently: itemToSet.index === item.index }), [itemToSet]);
    this._recentlyHighlightedItem.set(itemToSet);
  }
  highlightNextItem(offset: number, hasShift?: boolean): ArdOption | null {
    if (!this.isAnyItemHighlighted()) {
      return this.highlightFirstItem();
    }
    const currentItem = this._lastHighlightedItem() ?? this._highlightableItems().first();
    const highlightableItems = this._highlightableItems();
    const currentIndexInFiltered = highlightableItems.findIndex(item => item.index === currentItem.index);

    let nextItemIndex = currentIndexInFiltered + offset;
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
      }
      return this.highlightItem(itemToHighlight);
    }
    return this.highlightSingleItem(itemToHighlight);
  }
  filter(filterTerm: string): void {
    if (!filterTerm) {
      this.resetFiltered();
      return;
    }
    if (!this._ardParentComp.searchCaseSensitive()) {
      filterTerm = filterTerm.toLocaleLowerCase();
    }

    const searchFn = this._ardParentComp.searchFn();
    if (!searchFn) {
      return;
    }
    this._updateItems(item => {
      const searchResult = searchFn(filterTerm, item);
      return { ...item, filtered: searchResult[0], isExactMatch: searchResult[1] };
    });

    if (!this.isNoItemsFound) this.highlightFirstItem();
    else this.clearAllHighlights();
  }
  resetFiltered(): ArdOption[] {
    if (this.filteredItems().length === this.items().length) return this.items();

    this._updateItems(item => ({ ...item, filtered: true }));
    return this.items();
  }
}

function arrayEqualityFn<T>(a: T[], b: T[]): boolean {
  return a === b || (a.length === 0 && b.length === 0) || (a.length === b.length && a.every((v, i) => v === b[i]));
}
