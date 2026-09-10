import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    Inject,
    Input,
    input,
    model,
    OnChanges,
    output,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { isDefined, isNumber } from 'simple-bool';
import { _FocusableComponentBase } from '../_internal/focusable-component';
import { CheckboxState } from '../checkbox/checkbox.types';
import { ProgressBarMode } from '../progress-bar';
import { CurrentItemsFormatFn, PaginationAlign } from '../table-pagination/table-pagination.types';
import { ComponentColor, SimpleComponentColor } from '../types/colors.types';
import { Nullable } from '../types/utility.types';
import { ArdTableRow, HeaderCell, TableItemStorage, TableItemStorageHost } from './table-item-storage';
import { ARD_TABLE_DEFAULTS, ArdTableDefaults } from './table.defaults';
import {
    ArdiumTableCaptionTemplateDirective,
    ArdiumTableCheckboxTemplateDirective,
    ArdiumTableHeaderCheckboxTemplateDirective,
    ArdiumTableTemplateDirective,
} from './table.directives';
import {
    TableAlignType,
    TableAppearance,
    TableCaptionContext,
    TableCheckboxContext,
    TableDataColumn,
    TableHeaderCheckboxContext,
    TableHeaderContext,
    TablePaginationStrategy,
    TableSubheader,
    TableSubheaderContext,
    TableVariant,
} from './table.types';
import { isTableSubheader } from './utils';

@Component({
  standalone: false,
  selector: 'ard-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumTableComponent extends _FocusableComponentBase implements TableItemStorageHost, AfterContentInit, OnChanges {
  protected override readonly _DEFAULTS!: ArdTableDefaults;
  constructor(@Inject(ARD_TABLE_DEFAULTS) defaults: ArdTableDefaults) {
    super(defaults);
  }

  private readonly _itemStorage = new TableItemStorage(this);

  readonly rowDisabledFrom = input<string>(this._DEFAULTS.rowDisabledFrom);
  readonly rowBoldFrom = input<string>(this._DEFAULTS.rowBoldFrom);
  readonly invertRowDisabled = input<boolean, BooleanLike>(this._DEFAULTS.invertRowDisabled, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly invertRowBold = input<boolean, BooleanLike>(this._DEFAULTS.invertRowBold, { transform: v => coerceBooleanProperty(v) });

  readonly selectableRows = input<boolean, BooleanLike>(this._DEFAULTS.selectableRows, { transform: v => coerceBooleanProperty(v) });
  readonly maxSelectedItems = input<Nullable<number>, any>(this._DEFAULTS.maxSelectedItems, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.maxSelectedItems),
  });

  readonly clickableRows = input<boolean, BooleanLike>(this._DEFAULTS.clickableRows, { transform: v => coerceBooleanProperty(v) });

  readonly caption = input<Nullable<string>>(this._DEFAULTS.caption);

  readonly isLoading = input<boolean, BooleanLike>(this._DEFAULTS.isLoading, { transform: v => coerceBooleanProperty(v) });
  readonly loadingProgress = input<number, NumberLike>(this._DEFAULTS.loadingProgress, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.loadingProgress),
  });
  readonly loadingProgressBuffer = input<number, NumberLike>(this._DEFAULTS.loadingProgressBuffer, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.loadingProgressBuffer),
  });
  readonly loadingBarMode = input<ProgressBarMode>(this._DEFAULTS.loadingBarMode);
  readonly loadingBarColor = input<ComponentColor>(this._DEFAULTS.loadingBarColor);

  //! appearance
  readonly appearance = input<TableAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<TableVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);
  readonly align = input<TableAlignType>(this._DEFAULTS.align);
  readonly headerAlign = input<TableAlignType>(this._DEFAULTS.headerAlign);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });
  readonly zebra = input<boolean, BooleanLike>(this._DEFAULTS.zebra, { transform: v => coerceBooleanProperty(v) });
  readonly stickyHeader = input<boolean, BooleanLike>(this._DEFAULTS.stickyHeader, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-color-${this.color()}`,
      `ard-align-${this.align()}`,
      `ard-header-align-${this.headerAlign()}`,
      this.compact() ? 'ard-compact' : '',
      this.zebra() ? 'ard-zebra-table' : '',
      this.selectableRows() ? 'ard-selectable-rows' : '',
      this.stickyHeader() ? 'ard-sticky-header' : '',
      this.isLoading() ? 'ard-table-loading' : '',
    ].join(' ')
  );

  //! pagination
  readonly paginated = input<boolean, BooleanLike>(this._DEFAULTS.paginated, { transform: v => coerceBooleanProperty(v) });
  readonly paginationStrategy = input<TablePaginationStrategy>(this._DEFAULTS.paginationStrategy);
  readonly paginationOptions = input<
    number[] | { value: number; label: string }[],
    number[] | { value: number; label: string }[]
  >(this._DEFAULTS.paginationOptions, {
    transform: v => {
      return v.filter(el => {
        const opt = isNumber(el) ? el : el.value;
        if (opt <= 0 || opt % 1 !== 0) {
          console.error(
            new Error(
              `ARD-NF5052: each item of <ard-table>'s [paginationOptions] must be a positive integer. The "${opt}" option will be ignored.`
            )
          );
          return false;
        }
        return true;
      }) as number[] | { value: number; label: string }[];
    },
  });
  readonly totalItems = input<Nullable<number>, any>(this._DEFAULTS.totalItems, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.totalItems),
  });
  readonly paginationColor = input<ComponentColor>(this._DEFAULTS.paginationColor);
  readonly paginationAlign = input<PaginationAlign>(this._DEFAULTS.paginationAlign);
  readonly itemsPerPageText = input<string>(this._DEFAULTS.itemsPerPageText);
  readonly currentItemsFormatFn = input<CurrentItemsFormatFn>(this._DEFAULTS.currentItemsFormatFn);

  readonly pageFillRemaining = input<boolean, BooleanLike>(this._DEFAULTS.pageFillRemaining, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly paginationDisabled = input<boolean, BooleanLike>(this._DEFAULTS.paginationDisabled, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly useFirstLastButtons = input<boolean, BooleanLike>(this._DEFAULTS.useFirstLastButtons, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly itemsPerPage = model<number>(this._DEFAULTS.itemsPerPage);
  readonly page = model<number>(this._DEFAULTS.page);

  readonly isDefinedTotalItems = computed(
    () => this.paginationStrategy() !== TablePaginationStrategy.Noop || isDefined(this.totalItems())
  );
  readonly canDisplayPagination = computed(() => this.paginated() && this.isDefinedTotalItems());

  //! print errors if needed
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemsPerPage']) {
      const ipp = changes['itemsPerPage'].currentValue;
      const options =
        (changes['paginationOptions']?.currentValue as number[] | { value: number; label: string }[]) || this.paginationOptions();
      if (!options.find(v => (typeof v === 'number' ? v === ipp : v.value === ipp))) {
        console.error(
          new Error(
            `ARD-NF5051: value of "${ipp}" in <ard-table>'s [itemsPerPage] does not appear in [paginationOptions] array [${options
              .map(v => (typeof v === 'number' ? v : v.value))
              .join(', ')}]`
          )
        );
      }
    }
    if (changes['page']) {
      const page = changes['page'].currentValue as number;
      if (page === 0) {
        throw new Error(`ARD-FT5053a: <ard-table>'s [page] uses 1-indexed numbering system. The value 0 is not accepted.`);
      } else if (page < 0 || page % 1 !== 0) {
        throw new Error(`ARD-FT5053b: value of <ard-table>'s [page] must be a positive integer, got "${page}".`);
      }
    }
  }

  //! item storage getters
  readonly headerCells = computed(() => this._itemStorage.headerCells());

  readonly dataRows = computed(() => {
    const items: ArdTableRow[] = this._itemStorage.paginatedItems();

    if (!this.pageFillRemaining()) return items;
    if (!this.isDefinedTotalItems()) {
      throw new Error('ARD-FT5050: <ard-table> requires [totalItems] to be defined when using "slice" pagination strategy.');
    }
    if (this.page() === 1) return items;

    const ipp = this.itemsPerPage();
    for (let i = items.length; i < ipp; i++) {
      items.push(ArdTableRow.newEmptyCell(i));
    }
    return items;
  });

  //! columns/data setters
  @Input()
  set columns(v: (TableDataColumn | TableSubheader)[]) {
    this._itemStorage.setColumns(v);
  }
  private _data: any[] = [];
  @Input()
  set data(v: any[]) {
    this._data = v;
    this._itemStorage.setItems(v);
  }
  get data(): any[] {
    return this._data;
  }

  readonly treatDataSourceAsString = input<boolean, BooleanLike>(this._DEFAULTS.treatDataSourceAsString, {
    transform: v => coerceBooleanProperty(v),
  });

  //! templates
  readonly checkboxTemplate = contentChild<ArdiumTableCheckboxTemplateDirective, TemplateRef<TableCheckboxContext>>(
    ArdiumTableCheckboxTemplateDirective,
    {
      read: TemplateRef<TableCheckboxContext>,
    }
  );
  readonly headerCheckboxTemplate = contentChild<
    ArdiumTableHeaderCheckboxTemplateDirective,
    TemplateRef<TableHeaderCheckboxContext>
  >(ArdiumTableHeaderCheckboxTemplateDirective, {
    read: TemplateRef<TableHeaderCheckboxContext>,
  });
  readonly captionTemplate = contentChild<ArdiumTableCaptionTemplateDirective, TemplateRef<TableCaptionContext>>(
    ArdiumTableCaptionTemplateDirective,
    {
      read: TemplateRef<TableCaptionContext>,
    }
  );

  private _itemTemplates: Record<string, TemplateRef<any>> = {};
  readonly templateChildren = contentChildren<ArdiumTableTemplateDirective>(ArdiumTableTemplateDirective);

  ngAfterContentInit(): void {
    const templates = Array.from(this.templateChildren());
    for (const instance of templates) {
      const name = instance.name();
      if (!name) {
        console.error(new Error('ARD-FT5054: [ard-table-tmp] requires a value to be specified.'));
        continue;
      }
      this._itemTemplates[name] = instance.template;
    }
  }

  getHeaderTemplate(tmp: string | { template: string | TemplateRef<any> }): TemplateRef<any> | undefined {
    if (typeof tmp === 'string') return undefined;
    return this.getCellTemplate(tmp.template);
  }
  getHeaderCheckboxColor(): SimpleComponentColor {
    if (this.appearance() === TableAppearance.Strong) return SimpleComponentColor.CurrentColor;
    return this.color();
  }
  getCellTemplate(tmp?: string | TemplateRef<any>): TemplateRef<any> | undefined {
    //return undefined
    if (!tmp) return undefined;
    //return template, if it is one
    if (tmp instanceof TemplateRef) return tmp;
    //check if the name can be found
    if (!(tmp in this._itemTemplates)) {
      console.error(new Error(`ARD-NF5055: <ard-table> error: cannot find template named "${tmp}"`));
      return undefined;
    }
    //return the template
    return this._itemTemplates[tmp];
  }
  getCellStyle(cell: TableDataColumn | TableSubheader): string {
    if (isTableSubheader(cell)) return 'width:unset;min-width:unset';
    const width = typeof cell.width === 'number' ? `${cell.width}px` : cell.width;
    const minWidth = typeof cell.minWidth === 'number' ? `${cell.minWidth}px` : cell.minWidth;
    return [`width:${width ?? 'unset'}`, `min-width:${minWidth ?? 'unset'}`].join(';');
  }

  //! click & hover handlers
  onCheckboxClick(index: number): void {
    this.toggleRowSelected(index);
  }
  onRowClick(row: ArdTableRow, event: MouseEvent): void {
    if (this.clickableRows()) {
      event.stopPropagation();
      this.clickRowEvent.emit(row.itemData());
      return;
    }
    if (this.selectableRows()) {
      event.stopPropagation();
      this.toggleRowSelected(row.index());
      return;
    }
  }
  onRowMouseOver(event: MouseEvent): void {
    event.stopPropagation();
  }
  onRowMouseEnter(index: number, event: MouseEvent): void {
    if (!this.selectableRows() && !this.clickableRows()) return;
    event.stopPropagation();
    this._itemStorage.highlightSingleItem(index);
  }
  onRowMouseLeave(index: number, event: MouseEvent): void {
    if (!this.selectableRows() && !this.clickableRows()) return;
    event.stopPropagation();
    this._itemStorage.unhighlightItem(index);
  }

  //! select handlers
  /**
   * Toggles the selection state of a row in the table.
   * @param selected a boolean value indicating if the row is currently selected.
   * @param index the index of the row in the table.
   */
  toggleRowSelected(index: number): void {
    if (this._itemStorage.isItemSelected(index)) {
      const unselected = this._itemStorage.unselectItem(index);
      if (unselected.length) this.unselectRowEvent.emit(unselected);
    } else {
      const [selected, failed] = this._itemStorage.selectItem(index);
      if (selected.length) this.selectRowEvent.emit(selected);
      if (failed.length) this.failedSelectRowEvent.emit(failed);
    }
    this._emitSelect();
  }
  /**
   * Toggles the selection state of all rows in the table.
   */
  toggleAllRowsSelected(): void {
    if (this._itemStorage.areAllSelected()) {
      const unselected = this._itemStorage.unselectAll();
      if (unselected.length) this.unselectRowEvent.emit(unselected);
    } else {
      const [selected, failed] = this._itemStorage.selectAll();
      if (selected.length) this.selectRowEvent.emit(selected);
      if (failed.length) this.failedSelectRowEvent.emit(failed);
    }
    this._emitSelect();
  }
  private _emitSelect(): void {
    const v = this._itemStorage.value();
    this.selectedRowsChangeEvent.emit(v);
  }
  isCellCheckbox(cell: any): boolean {
    return typeof cell === 'object' && '_ardCheckbox' in cell && 'index' in cell;
  }
  isHeaderCellCheckbox(cell: HeaderCell): boolean {
    const dataCell = cell.cell();
    if (isTableSubheader(dataCell)) return false;
    if (typeof dataCell.dataSource === 'string') return false;
    return dataCell.dataSource.type === 'checkbox';
  }
  isHeaderCellSortable(cell: HeaderCell): boolean {
    const dataCell = cell.cell();
    if (isTableSubheader(dataCell)) return false;
    return dataCell.sortable ?? false;
  }

  readonly selectedRowsChangeEvent = output<any[]>({ alias: 'selectedRowsChange' });
  readonly failedSelectRowEvent = output<any[]>({ alias: 'failedSelectRow' });
  readonly selectRowEvent = output<any[]>({ alias: 'selectRow' });
  readonly unselectRowEvent = output<any[]>({ alias: 'unselectRow' });
  readonly clickRowEvent = output<any>({ alias: 'clickRow' });

  //! contexts
  getHeaderContext(cell: TableDataColumn, index: number): TableHeaderContext | null;
  getHeaderContext(cell: TableSubheader, index: number): TableSubheaderContext | null;
  getHeaderContext(cell: TableDataColumn | TableSubheader, index: number): TableHeaderContext | TableSubheaderContext | null;
  getHeaderContext(cell: TableDataColumn | TableSubheader, index: number): TableHeaderContext | TableSubheaderContext | null {
    if (typeof cell.header !== 'string') return null;
    if (isTableSubheader(cell))
      return {
        $implicit: cell.header,
        header: cell.header,
      };
    return {
      $implicit: cell.header,
      header: cell.header,
      sortable: cell.sortable ?? false,
      sortType: this._itemStorage.getColumnSortType(index),
      onTriggerSort: () => this._itemStorage.toggleCurrentSortColumn(index),
      onTriggerResetSort: (event?: Event) => {
        this._itemStorage.resetSort();
        event?.preventDefault();
        event?.stopPropagation();
      },
    };
  }
  readonly getHeaderCheckboxContext = computed<TableHeaderCheckboxContext>(() => {
    let state: CheckboxState = CheckboxState.Unselected;
    if (this._itemStorage.isAnyItemSelected()) {
      state = CheckboxState.Indeterminate;
      if (this._itemStorage.areAllSelected()) {
        state = CheckboxState.Selected;
      }
    }
    return {
      $implicit: state,
      state,
      onChange: () => {
        this.toggleAllRowsSelected();
      },
    };
  });
  getCheckboxContext(index: number): TableCheckboxContext {
    const item = this._itemStorage.items().find(v => v.index() === index)!;
    const selected = item.selected();
    return {
      $implicit: selected,
      selected: selected,
      disabled: item.disabled(),
      onChange: () => {
        this.onCheckboxClick(index);
      },
    };
  }
}
