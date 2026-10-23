import { Signal, computed, signal } from '@angular/core';
import { resolvePath } from 'resolve-object-path';
import { evaluate, isDefined, isNull } from 'simple-bool';
import { Nullable } from '../types/utility.types';
import { SortType, TableDataColumn, TablePaginationStrategy, TableSubheader } from './table.types';
import { areAllDataColumns, isTableSubheader, merge2dArrays } from './utils';

export class ArdTableRow {
  private readonly _itemData = signal<any>(undefined);
  readonly itemData = this._itemData.asReadonly();

  private readonly _index = signal<number>(-1);
  readonly index = this._index.asReadonly();

  private readonly _isEmpty = signal<boolean>(false);
  readonly isEmpty = this._isEmpty.asReadonly();

  private readonly _data = signal<any[]>([]);
  readonly data = this._data.asReadonly();

  private readonly _dataColumns = signal<TableDataColumn[]>([]);
  readonly dataColumns = this._dataColumns.asReadonly();

  private readonly _class = signal<string>('');
  readonly class = this._class.asReadonly();

  readonly disabled = signal<boolean>(false);
  readonly bold = signal<boolean>(false);
  readonly selected = signal<boolean>(false);
  readonly highlighted = signal<boolean>(false);

  constructor(
    itemData: any,
    index: number,
    data: any[],
    dataColumns: TableDataColumn[],
    disabled: boolean,
    bold: boolean,
    isEmpty = false
  ) {
    this._itemData.set(itemData);
    this._index.set(index);
    this._data.set(data);
    this._dataColumns.set(dataColumns);
    this.disabled.set(disabled);
    this.bold.set(bold);
    this._isEmpty.set(isEmpty);
  }
  static newEmptyCell(index: number) {
    return new ArdTableRow(null, index, [], [], false, false, true);
  }
}
export interface TableItemStorageHost {
  readonly rowDisabledFrom: Signal<string>;
  readonly rowBoldFrom: Signal<string>;
  readonly invertRowDisabled: Signal<boolean>;
  readonly invertRowBold: Signal<boolean>;
  readonly data: Signal<Nullable<any>>[];
  readonly maxSelectedItems: Signal<Nullable<number>>;
  readonly treatDataSourceAsString: Signal<boolean>;

  readonly paginated: Signal<boolean>;
  readonly paginationStrategy: Signal<TablePaginationStrategy>;
  readonly itemsPerPage: Signal<number>;
  readonly page: Signal<number>;
}
export class HeaderCell {
  readonly cell = signal<TableDataColumn | TableSubheader>(undefined as any);
  readonly colspan = signal<number>(1);
  readonly rowspan = signal<number>(1);

  constructor(cell: TableDataColumn | TableSubheader, colspan = 1, rowspan = 1) {
    this.cell.set(cell);
    this.colspan.set(colspan);
    this.rowspan.set(rowspan);
  }

  get width(): string | null {
    const cell = this.cell();
    if (isTableSubheader(cell)) return null;
    return this._getWidth(cell.width);
  }
  get minWidth(): string | null {
    const cell = this.cell();
    if (isTableSubheader(cell)) return null;
    return this._getWidth(cell.minWidth);
  }
  /**
   * Thransforms a numeric width into a CSS string if needed. Pure function.
   * @param width the width to be converted.
   * @returns The width expressed as a CSS-compatible string or null.
   */
  private _getWidth(width: string | number | undefined): string | null {
    if (!width) return null;
    if (typeof width === 'number') return `${width}px`;
    return width;
  }
}

export class TableItemStorage {
  private readonly _items = signal<ArdTableRow[]>([]);
  private readonly _sortedItems = signal<ArdTableRow[]>([]);

  private readonly _dataColumns = signal<TableDataColumn[]>([]);
  private readonly _headerCells = signal<HeaderCell[][]>([]);

  constructor(private readonly _ardParentComp: TableItemStorageHost) {}

  /**
   * Gets all items.
   */
  readonly items = this._items.asReadonly();
  readonly sortedItems = this._sortedItems.asReadonly();
  /**
   * Gets items based on the current pagination state.
   */
  readonly paginatedItems = computed(() => {
    if (!this._ardParentComp.paginated() || this._ardParentComp.paginationStrategy() === TablePaginationStrategy.Noop) {
      return this.sortedItems();
    }
    const page = this._ardParentComp.page();
    const IPP = this._ardParentComp.itemsPerPage();
    const itemsStart = (page - 1) * IPP;
    const itemsEnd = page * IPP;
    return this.sortedItems().slice(itemsStart, itemsEnd);
  });
  /**
   * Gets all currently selected items.
   */
  readonly selectedItems = computed<ArdTableRow[]>(() => this.items().filter(item => item.selected()));
  /**
   * Gets all currently highlighted items.
   */
  readonly highlightedItems = computed<ArdTableRow[]>(() => this.items().filter(item => item.highlighted()));
  /**
   * Gets all highlightable items. An item is considered highlightable if it is **not** disabled.
   */
  readonly highlightableItems = computed<ArdTableRow[]>(() => this._items().filter(item => !item.disabled()));
  /**
   * Gets the values of the currently selected items.
   */
  readonly value = computed(() => this._itemsToValue(this.selectedItems()));
  /**
   * Maps an array of items into their values.
   * @param items The items to convert to value.
   * @returns An array of item values.
   */
  private _itemsToValue(items: ArdTableRow[]): any[] {
    return items.map(item => item.itemData());
  }

  /**
   * Returns true if at least one item is highlighted, otherwise false.
   */
  readonly isAnyItemHighlighted = computed(() => this.highlightedItems().length > 0);
  /**
   * Checks if any item in the table is selected.
   * @returns A boolean value indicating if any item is selected.
   */
  readonly isAnyItemSelected = computed(() => this.selectedItems().length > 0);
  /**
   * Checks if all items in the table are selected.
   * @returns A boolean value indicating if all items are selected.
   */
  readonly areAllSelected = computed(() => this.selectedItems().length === this._items().filter(item => !item.disabled()).length);
  /**
   * Returns true if the parent component defines the limit of concurrently selectable items and the amount of currently selected items matches that limit. Otherwise returns false.
   *
   * **TLDR**: true if `maxSelectedItems` is defined and the number of selected items matches that value.
   */
  readonly isItemLimitReached = computed(() => {
    const max = this._ardParentComp.maxSelectedItems();
    if (!isDefined(max)) {
      return false;
    }
    return max <= this.selectedItems().length;
  });

  /**
   * Gets the header cells of the table.
   * @returns a 2D array of header cells.
   */
  readonly headerCells = this._headerCells.asReadonly();
  /**
   * Checks if the table has defined columns.
   * @returns a boolean value indicating if the table has defined columns.
   */
  readonly hasDefinedColumns = computed(() => this._dataColumns().length > 0);

  //! setting columns
  /**
   * Sets the columns of the table.
   * @param cols an array of table data columns or table subheaders.
   */
  setColumns(cols: (TableDataColumn | TableSubheader)[]): void {
    const maxNestingLevel = this._getHeaderMaxNesting(cols);
    const headerCells = this._mapColumnsToArray(cols, maxNestingLevel, 0);
    this._headerCells.set(this._filterHeaderCells(headerCells));
    this._dataColumns.set(this._extractDataSources(cols));
  }
  /**
   * Filters out null values from the header cells array. Pure function.
   * @param cells a 2D array of header cells or null values.
   * @returns a 2D array of header cells without null values and empty arrays.
   */
  private _filterHeaderCells(cells: (HeaderCell | null)[][]): HeaderCell[][] {
    for (let i = 0; i < cells.length; i++) {
      cells[i] = cells[i].filter(v => v !== null);
    }
    return cells.filter(row => row.length) as HeaderCell[][];
  }
  /**
   * Extracts the data sources from the columns array. Pure function.
   * @param cols an array of table data columns or table subheaders.
   * @returns an array of table data columns.
   */
  private _extractDataSources(cols: (TableDataColumn | TableSubheader)[]): TableDataColumn[] {
    const dataColumns: TableDataColumn[] = [];

    for (const col of cols) {
      if (!isTableSubheader(col)) {
        dataColumns.push(col);
        continue;
      }
      dataColumns.push(...this._extractDataSources(col.children));
    }

    return dataColumns;
  }
  /**
   * Gets the maximum nesting level of the columns array. Pure function.
   * @param cols an array of table data columns or table subheaders.
   * @returns the maximum nesting level as a number.
   */
  private _getHeaderMaxNesting(cols: (TableDataColumn | TableSubheader)[]): number {
    if (areAllDataColumns(cols)) return 1;
    let max = 1;
    for (const col of cols.filter(v => isTableSubheader(v)) as TableSubheader[]) {
      const height = 1 + this._getHeaderMaxNesting(col.children);
      if (height > max) max = height;
    }
    return max;
  }
  /**
   * Maps the columns tree to a 2D array of header cells or null values. Pure function.
   * @param cols an array of table data columns or table subheaders.
   * @param maxNesting the maximum nesting level of the columns array.
   * @param currentNesting the current nesting level of the columns array.
   * @returns a 2D array of header cells or null values.
   */
  private _mapColumnsToArray(
    cols: (TableDataColumn | TableSubheader)[],
    maxNesting: number,
    currentNesting: number
  ): (HeaderCell | null)[][] {
    if (areAllDataColumns(cols)) {
      return [cols.map(col => new HeaderCell(col, 1, maxNesting - currentNesting))];
    }
    const headerCells: (HeaderCell | null)[][] = [[]];
    for (const col of cols) {
      if (!isTableSubheader(col)) {
        headerCells[0].push(new HeaderCell(col, 1, maxNesting - currentNesting));
        continue;
      }
      const childCells: (HeaderCell | null)[][] = [[], ...this._mapColumnsToArray(col.children, maxNesting, currentNesting + 1)];
      const height = childCells.length - 1;
      const width = childCells[1].length;
      for (let i = 0; i < height; i++) {
        headerCells.push([null]);
      }
      headerCells[0].push(new HeaderCell(col, width, 1));
      for (let i = 0; i < width - 1; i++) {
        headerCells[0].push(null);
      }
      merge2dArrays(headerCells, childCells);
    }
    return headerCells;
  }

  //! setting items
  /**
   * Sets the component's items. Takes into account the values defined by the parent component for `rowDisabledFrom`, `rowBoldFrom`, and `rowHighlightedFrom`.
   * @param items An array of items to be set as the component's items.
   */
  setItems(items: any[]): void {
    if (!this.hasDefinedColumns()) return;

    const mappedItems = items.map((item, i) => this._setItemsMapFn(item, i));
    this._items.set(mappedItems);
    this._sortedItems.set(mappedItems);
  }
  /**
   * Maps raw item data to an {@link ArdTableRow} object.
   *
   * @param {any} rawItemData - The raw data of the item.
   * @param {number} index - The index of the item.
   * @returns {ArdTableRow} Returns an ArdTableRow object with mapped properties.
   * @private
   */
  private _setItemsMapFn(rawItemData: any, index: number): ArdTableRow {
    //get data
    const [data, dataColumns] = this._getRowData(rawItemData, index);

    //get bold
    const rowBoldFromPath = this._ardParentComp.rowBoldFrom();
    let bold = resolvePath(rawItemData, rowBoldFromPath);
    if (this._ardParentComp.invertRowBold()) {
      bold = !bold;
    }

    //get disabled
    const disabledPath = this._ardParentComp.rowDisabledFrom();
    let disabled = evaluate(resolvePath(rawItemData, disabledPath));
    if (this._ardParentComp.invertRowDisabled()) {
      disabled = !disabled;
    }

    return new ArdTableRow(rawItemData, index, data, dataColumns, disabled, bold);
  }
  /**
   * Retrieves data for a row based on data columns configuration.
   *
   * @param {any} rawItemData - The raw data of the item.
   * @param {number} index - The index of the item.
   * @returns {any[]} Returns an array containing the row data.
   * @private
   */
  private _getRowData(rawItemData: any, index: number): [any[], TableDataColumn[]] {
    const data: any[] = [];
    const _cols = this._dataColumns();
    for (let i = 0; i < _cols.length; i++) {
      const dataColumn = _cols[i];
      const sourcePath = dataColumn.dataSource;

      if (typeof sourcePath === 'string') {
        if (this._ardParentComp.treatDataSourceAsString()) {
          data.push(rawItemData[sourcePath]);
          continue;
        }
        data.push(resolvePath(rawItemData, sourcePath));
        continue;
      }
      if (sourcePath.type === 'autocount') {
        data.push(index + 1);
        continue;
      }
      if (sourcePath.type === 'checkbox') {
        data.push({ _ardCheckbox: true, index });
        continue;
      }
      const sourceString = typeof sourcePath === 'object' ? JSON.stringify(sourcePath) : sourcePath;
      throw new Error(`ARD-FT5052: Unexpected data source "${sourceString}" at index ${i}.`);
    }
    return [data, this._dataColumns()];
  }

  //! selecting items
  /**
   * Checks if an item with the given index is selected.
   *
   * @param {number} index The index of the item to check.
   * @returns {boolean} _true_ if the item is selected, otherwise _false_.
   */
  isItemSelected(index: number): boolean {
    return this.selectedItems().some(item => item.index() === index);
  }
  /**
   * Selects all items.
   *
   * Accounts for the limit of concurrently selected items defined by the parent component.
   * @returns a tuple containing two arrays:
   * * An array of items selected.
   * * An array of items failed to select.
   */
  selectAll(): [any[], any[]] {
    return this.selectItem(...this._items().map(v => v.index()));
  }
  /**
   * Unselects all selected items.
   *
   * If the parent component requires at least one value to be selected at all times, the first selected items is left selected.
   * @returns An array of items cleared, mapped to only their values.
   */
  unselectAll(): any[] {
    const selected = this.selectedItems();
    for (const item of selected) {
      item.selected.set(false);
    }

    return this._itemsToValue(selected);
  }
  /**
   * Unselects all selected items, no matter what the component settings are.
   * @returns An array of items cleared, mapped to only their values.
   */
  private _forceUnselectAll(): any[] {
    const selected = this.selectedItems();
    for (const item of selected) {
      item.selected.set(false);
    }

    return this._itemsToValue(selected);
  }
  /**
   * Selects one or multiple items.
   *
   * Accounts for the limit of concurrently selected items defined by the parent component.
   *
   * @param indexes A rest operator array of item indexes to be selected.
   * @returns a tuple containing two arrays:
   * - An array of items selected.
   * - An array of items failed to select.
   */
  selectItem(...indexes: number[]): [any[], any[]] {
    const itemsToBeSelected = this._items().filter(item => !item.disabled() && indexes.includes(item.index()));
    if (this.isItemLimitReached()) {
      return [[], this._itemsToValue(itemsToBeSelected)];
    }

    let itemsSelectedCount = 0;
    const itemsSelected = [];
    let itemsLeftUntilLimit = (this._ardParentComp.maxSelectedItems() ?? Infinity) - this.selectedItems().length;
    for (const item of itemsToBeSelected) {
      itemsSelectedCount++;
      if (item.selected()) continue;
      if (itemsLeftUntilLimit <= 0) {
        break;
      }
      itemsLeftUntilLimit--;
      item.selected.set(true);
      itemsSelected.push(item);
    }

    const itemsFailedToSelect = itemsToBeSelected.slice(itemsSelectedCount - 1);
    return [this._itemsToValue(itemsSelected), this._itemsToValue(itemsFailedToSelect)];
  }
  /**
   * Unselects one or multiple items.
   * @param items A rest operator array of item indexes to be unselected.
   * @returns An array of items unselected, mapped to only their values.
   */
  unselectItem(...indexes: number[]): any[] {
    const itemsToBeUnselected = this._items().filter(item => indexes.includes(item.index()));
    for (const item of itemsToBeUnselected) {
      item.selected.set(false);
    }

    return this._itemsToValue(itemsToBeUnselected);
  }

  //! highlighting items
  /**
   * Unhighlights all currently highlighted items.
   */
  unhighlightAll(): void {
    const highlighted = this.highlightedItems();
    for (const item of highlighted) {
      item.highlighted.set(false);
    }
  }
  /**
   * Highlights the given item, while unhighlighting all other items. Does nothing when the item is disabled.
   * @param item The index of the item to be highlighted.
   * @returns The highlighted item.
   */
  highlightSingleItem(index: number): ArdTableRow | null {
    this.unhighlightAll();
    return this.highlightItem(index);
  }
  /**
   * Highlights all given items.
   * @param items A rest operator array of item indexes to be highlighted.
   * @returns The last highlighted item.
   */
  highlightItem(...indexes: number[]): ArdTableRow {
    const items = this._items().filter(item => indexes.includes(item.index()));
    for (const item of items) {
      item.highlighted.set(true);
    }
    return items.last();
  }
  /**
   * Unhighlights all given items.
   * @param items A rest operator array of item indexes to be unhighlighted.
   */
  unhighlightItem(...indexes: number[]): void {
    const items = this._items().filter(item => indexes.includes(item.index()));
    for (const item of items) {
      if (!item || !item.highlighted()) return;

      item.highlighted.set(false);
    }
  }
  /**
   * Highlights the first item out of all items.
   * @returns The highlighted item.
   */
  highlightFirstItem(): ArdTableRow | null {
    this.unhighlightAll();

    const itemToHighlight = this.highlightableItems().first().index();
    return this.highlightItem(itemToHighlight);
  }
  /**
   * Highlights the last item out of all items.
   * @returns The highlighted item.
   */
  highlightLastItem(): ArdTableRow | null {
    this.unhighlightAll();

    const itemToHighlight = this.highlightableItems().last().index();
    return this.highlightItem(itemToHighlight);
  }
  /**
   * Highlights all non-disabled items.
   */
  highlightAllItems(): void {
    const itemsToHighlight = this.highlightableItems().map(v => v.index());
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
  highlightNextItem(offset: number, hasShift?: boolean): ArdTableRow | null {
    if (!this.isAnyItemHighlighted()) {
      return this.highlightFirstItem();
    }
    const currentItem = this.highlightedItems().last();
    const itemsWithoutDisabled = this._items().filter(
      item => !item.disabled() && (!this.isItemLimitReached() || item.selected())
    );
    const currentIndexInItems = itemsWithoutDisabled.findIndex(item => item.index() === currentItem.index());

    let nextItemIndex = currentIndexInItems + offset;
    if (nextItemIndex >= itemsWithoutDisabled.length) {
      nextItemIndex -= itemsWithoutDisabled.length;
    }
    if (nextItemIndex < 0) {
      nextItemIndex += itemsWithoutDisabled.length;
    }
    const itemToHighlight = itemsWithoutDisabled[nextItemIndex];

    if (hasShift) {
      if (itemToHighlight.highlighted()) {
        this.unhighlightItem(nextItemIndex);
      }
      return this.highlightItem(nextItemIndex);
    }
    return this.highlightSingleItem(nextItemIndex);
  }

  //! sorting
  private _currentSortColumn: number | null = null;
  private _currentSortType: SortType | null = null;

  toggleCurrentSortColumn(column: number): void {
    if (this._currentSortColumn === column) {
      if (this._currentSortType === SortType.Ascending) {
        this._currentSortType = SortType.Descending;
      } else {
        this._currentSortType = SortType.Ascending;
      }
      this._generateSortedRows(true);
      return;
    }
    this._currentSortColumn = column;
    this._currentSortType = SortType.Ascending;
    this._generateSortedRows();
  }
  resetSort(): void {
    this._currentSortColumn = null;
    this._currentSortType = null;
    this._sortedItems.set([...this.items()]);
  }
  getColumnSortType(column: number): SortType | null {
    if (this._currentSortColumn === column) {
      return this._currentSortType;
    }
    return null;
  }
  private _generateSortedRows(justReverse?: boolean): void {
    if (justReverse) {
      this._sortedItems.update(v => [...v.reverse()]);
      return;
    }
    const sortColumnIndex = this._currentSortColumn;
    if (isNull(sortColumnIndex) || !this._currentSortType) {
      this._sortedItems.set(this.items());
      return;
    }
    const sortColumn = this._dataColumns()[sortColumnIndex];
    if (!sortColumn) {
      throw new Error(
        `ARD-IS5059: Encountered an issue in <ard-table>: could not find the column with index ${sortColumnIndex}. This is most likely an Ardium UI bug, please report it to the creators.`
      );
    }

    const direction = this._currentSortType === SortType.Ascending ? 1 : -1;
    const sortFn =
      sortColumn.sortFn ??
      ((a, b) => {
        if (a > b) return direction;
        if (a < b) return -1 * direction;
        return 0;
      });

    this._sortedItems.set([...this.items()].sort((a, b) => sortFn(a.data()[sortColumnIndex], b.data()[sortColumnIndex])));
  }
}
