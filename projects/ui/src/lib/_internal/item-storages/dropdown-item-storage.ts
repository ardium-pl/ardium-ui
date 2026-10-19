import { computed, effect, Signal, signal, WritableSignal } from '@angular/core';
import { arraySignal } from '@ardium-pl/devkit';
import { resolvePath } from 'resolve-object-path';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { evaluate, isArray, isDefined, isObject, isPrimitive, isPromise } from 'simple-bool';
import { AddCustomFn } from '../../select/select.types';
import {
  ArdItemGroupMap,
  ArdOption,
  ArdOptionGroup,
  CompareWithFn,
  ForcedStructureOption,
  GroupByFn,
  SearchFn,
} from '../../types/item-storage.types';
import { Nullable } from '../../types/utility.types';

export interface ItemStorageHost {
  readonly value: WritableSignal<any[] | any>;
  readonly optionsFromInput: Signal<any[]>;
  readonly optionsFromComponents: Signal<ForcedStructureOption[]>;
  readonly valueFrom: Signal<string>;
  readonly labelFrom: Signal<string>;
  readonly disabledFrom: Signal<string>;
  readonly invertDisabled: Signal<boolean>;
  readonly groupLabelFrom: Signal<string | GroupByFn>;
  readonly groupDisabledFrom: Signal<string>;
  readonly hideSelected: Signal<boolean>;
  readonly searchCaseSensitive: Signal<boolean>;
  readonly searchTerm: WritableSignal<string>;
  readonly searchFn: Signal<SearchFn>;
  readonly compareWith: Signal<Nullable<CompareWithFn>>;
  readonly multiselectable: Signal<boolean>;
  readonly maxLength: Signal<Nullable<number>>;
  readonly addCustom: Signal<boolean | AddCustomFn<any> | AddCustomFn<Promise<any>>>;
  readonly _componentId: string;
}

export class ItemStorage {
  constructor(private readonly _ardParentComp: ItemStorageHost) {
    effect(() => {
      this._isValueObjectValid(this._ardParentComp.value());
    });
  }

  //! options
  private readonly _mappedOptionsFromInput = computed<ArdOption[]>(
    () => {
      const optionsFromInput = this._ardParentComp.optionsFromInput();
      return optionsFromInput.map(item => this._mapInputOptionsToArdOption(item));
    },
    { equal: arrayEqualityFn }
  );
  private readonly _mappedOptionsFromComponents = computed<ArdOption[]>(
    () => {
      const optionsFromComponents = this._ardParentComp.optionsFromComponents();
      return this._mapForcedStructureOptionsToArdOptions(optionsFromComponents);
    },
    { equal: arrayEqualityFn }
  );
  private readonly _customOptions = arraySignal<ArdOption>([]);
  private readonly _unpopulatedOptions = computed<ArdOption[]>(
    () => {
      const optionsFromInput = this._mappedOptionsFromInput();
      const optionsFromComponents = this._mappedOptionsFromComponents();
      return [...(optionsFromInput.length > 0 ? optionsFromInput : optionsFromComponents), ...this._customOptions()];
    },
    {
      equal: arrayEqualityFn,
    }
  );

  private _mapForcedStructureOptionsToArdOptions(forcedStructureOptions: ForcedStructureOption[]): ArdOption[] {
    return forcedStructureOptions.map((item, index) => {
      return {
        itemData: item,
        index: -1, // set later when merging with other options
        value: item.value,
        label: item.label,
        disabled: item.disabled,
        selected: false,
        highlighted: false,
        group: undefined,
      };
    });
  }
  private _mapInputOptionsToArdOption(rawItemData: any): ArdOption {
    if (isPrimitive(rawItemData)) {
      return {
        itemData: { value: rawItemData },
        index: -1, // set later when merging with other options
        value: rawItemData,
        label: rawItemData?.toString?.() ?? String(rawItemData),
        disabled: false,
        selected: false,
        highlighted: false,
        group: undefined,
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
      index: -1, // set later when merging with other options
      value: value,
      label: label?.toString?.() ?? String(label),
      disabled: disabled,
      group: group,
      selected: false,
      highlighted: false,
    };
  }
  /**
   * Gets all items.
   */
  readonly options = computed<ArdOption[]>(() =>
    this._unpopulatedOptions().map((item, index) => ({
      ...item,
      index,
      selected: this._valueAsArray().some(v => this._itemHasValueOf(item, v)),
      highlighted: this._highlightedOptions().some(v => this._itemHasValueOf(item, v.value)),
    }))
  );

  private _itemHasValueOf(option: ArdOption, valueToCompare: any): boolean {
    let findBy: (item: ArdOption) => boolean;
    const cmpFn = this._ardParentComp.compareWith();
    if (isDefined(cmpFn)) {
      findBy = item => cmpFn(valueToCompare, item.value);
    } else {
      findBy = item => item.value === valueToCompare;
    }
    return findBy(option);
  }

  //! value
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

  private _itemsToValue(items: ArdOption[]): any[] {
    return items.map(item => item.value);
  }

  private readonly _highlightedOptions = arraySignal<ArdOption>([]);

  /**
   * Gets all currently selected items.
   */
  readonly selectedItems = computed<ArdOption[]>(() => this.options().filter(item => item.selected), {
    equal: arrayEqualityFn,
  });
  /**
   * Gets all currently highlighted items.
   */
  readonly highlightedItems = computed<ArdOption[]>(() => this.options().filter(item => item.highlighted), {
    equal: arrayEqualityFn,
  });
  private readonly _lastHighlightedOption = signal<Nullable<ArdOption>>(undefined);
  private readonly _recentlyHighlightedOption = signal<Nullable<ArdOption>>(undefined);
  readonly recentlyHighlightedOption = this._recentlyHighlightedOption.asReadonly();

  readonly isNoItemsToSelect = computed(() => this.options().length === this.selectedItems().length);
  readonly isAnyItemSelected = computed(() => this.selectedItems().length > 0);
  readonly isAnyItemHighlighted = computed(() => this.highlightedItems().length > 0);

  readonly itemsLeftUntilLimit = computed(() =>
    this._ardParentComp.multiselectable() && isDefined(this._ardParentComp.maxLength())
      ? this._ardParentComp.maxLength()! - this.selectedItems().length
      : 1
  );
  readonly isItemLimitReached = computed(() => this.itemsLeftUntilLimit() <= 0);
  private readonly _highlightableItems = computed(() =>
    this.filteredItems().filter(
      item =>
        !item.disabled && (this._ardParentComp.hideSelected() ? !item.selected : this.isItemLimitReached() ? item.selected : true)
    )
  );

  private _isValueObjectValid(ngModel: any[] | any): boolean {
    return (isArray(ngModel) ? ngModel : [ngModel]).every(item => {
      if (!isDefined(this._ardParentComp.compareWith) && isObject(item)) {
        console.warn(
          `ARD-WA${this._ardParentComp._componentId}0: [valueFrom] can only point to a property of a primitive type. Define [compareWith] if using objects as a value is needed.`
        );
        return false;
      }
      return true;
    });
  }

  //! filter
  readonly searchTerm = computed(() => {
    const term = this._ardParentComp.searchTerm().trim();
    return this._ardParentComp.searchCaseSensitive() ? term : term.toLowerCase();
  });
  private readonly _searchResults = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm) return null;

    const searchFn = this._ardParentComp.searchFn();

    const results = this.options().map(item => {
      const searchResult = searchFn(searchTerm, item);
      return {
        item,
        matches: searchResult[0],
        isExactMatch: searchResult[1],
      };
    });
    return {
      results,
      isExactMatchFound: results.some(result => result.isExactMatch),
    };
  });
  readonly filteredItems = computed<ArdOption[]>(
    () =>
      this._searchResults()
        ?.results.filter(result => result.matches)
        .map(result => result.item) ?? this.options()
  );
  readonly isNoItemsFound = computed(() => this.filteredItems().length === 0);
  readonly isAnyItemExactMatch = computed(() => this._searchResults()?.isExactMatchFound ?? false);

  //! groups
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

  readonly groups = computed(() =>
    Array.from(this._groups().entries())
      .map(([, group]) => group)
      .filter(group => group.children.length)
  );

  //! custom options
  async addCustomOption(
    rawValue: string,
    fn: AddCustomFn<any> | AddCustomFn<Promise<any>> | AddCustomFn<Observable<any>>
  ): Promise<ArdOption | null> {
    let itemData = fn(rawValue);

    if (isObservable(itemData)) {
      itemData = await firstValueFrom(itemData);
    } else if (isPromise(itemData)) {
      try {
        itemData = await itemData;
      } catch (error) {
        console.error(
          `ARD-NF${this._ardParentComp._componentId}2: Failed to add a custom option. The promise was rejected with the following error:`,
          error
        );
        return null;
      }
    }

    const newOptionObj = this._mapInputOptionsToArdOption(itemData);
    this._customOptions.push(newOptionObj);

    return newOptionObj;
  }

  //! selection
  clearAllSelected(): any[] {
    const removedItemValues = this._ardParentComp.value();
    this._setValue([]);
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
    const itemsToAdd = new Set<any>();
    const itemsSelected: any[] = [];

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
  unselectItem(...items: ArdOption[]): any[] {
    const itemsValue = this._itemsToValue(items);
    const itemsToRemove = new Set(itemsValue);

    this._setValue(this._valueAsArray().filter(value => !itemsToRemove.has(value)));

    if (!this._lastHighlightedOption()) {
      this._lastHighlightedOption.set(items.last());
    }

    return itemsValue;
  }
  toggleItem(item: ArdOption): void {
    if (item.selected) {
      this.unselectItem(item);
      return;
    }
    this.selectItem(item);
  }

  //! highlighting
  clearAllHighlights(): void {
    this._highlightedOptions.set([]);
    this._lastHighlightedOption.set(undefined);
  }
  highlightGroup(group: ArdOptionGroup): ArdOption {
    const childrenIndexes = new Set(group.children.map(item => item.index));

    const itemsToHighlight = this._highlightableItems().filter(item => childrenIndexes.has(item.index));
    this._highlightedOptions.push(...itemsToHighlight);
    this._lastHighlightedOption.set(itemsToHighlight.last());

    return itemsToHighlight[0];
  }
  highlightSingleItem(item: ArdOption): ArdOption | null {
    if (!item || item.disabled) return null;
    this._highlightedOptions.set([item]);
    this._lastHighlightedOption.set(item);
    return item;
  }
  highlightItem(...items: ArdOption[]): ArdOption {
    this._highlightedOptions.push(...items.filter(item => !item.disabled));
    this._lastHighlightedOption.set(items.last());
    return items.last();
  }
  unhighlightItem(...items: ArdOption[]): void {
    this._highlightedOptions.filter(item => !items.some(i => i.index === item.index));
    this._lastHighlightedOption.set(this._highlightedOptions().last());
  }
  highlightFirstItem(): ArdOption | null {
    const itemToHighlight = this._highlightableItems().first();

    this._highlightedOptions.set(itemToHighlight ? [itemToHighlight] : []);
    this._lastHighlightedOption.set(itemToHighlight);
    return itemToHighlight;
  }
  highlightLastItem(): ArdOption | null {
    const itemToHighlight = this._highlightableItems().last();

    this._highlightedOptions.set(itemToHighlight ? [itemToHighlight] : []);
    this._lastHighlightedOption.set(itemToHighlight);
    return itemToHighlight;
  }
  highlightAllItems(): void {
    this._highlightedOptions.set(this._highlightableItems());
    this._lastHighlightedOption.set(this._highlightedOptions().last());
  }
  setRecentlyHighlighted(itemToSet: ArdOption): void {
    this._recentlyHighlightedOption.set(itemToSet);
  }
  highlightNextItem(offset: number, hasShift?: boolean): ArdOption | null {
    if (!this.isAnyItemHighlighted()) {
      return this.highlightFirstItem();
    }
    const currentItem = this._lastHighlightedOption() ?? this._highlightableItems().first();
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
}

function arrayEqualityFn<T>(a: T[], b: T[]): boolean {
  return a === b || (a.length === 0 && b.length === 0) || (a.length === b.length && a.every((v, i) => v === b[i]));
}
