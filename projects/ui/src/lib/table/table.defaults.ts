import { InjectionToken, Provider, Type } from '@angular/core';
import { _focusableComponentDefaults, _FocusableComponentDefaults } from '../_internal/focusable-component';
import { ProgressBarMode } from '../progress-bar';
import { CurrentItemsFormatFn, PaginationAlign } from '../table-pagination';
import { TableAlignType, TableAppearance, TablePaginationStrategy, TableVariant } from '../table/table.types';
import { ComponentColor } from '../types/colors.types';
import { Nullable } from '../types/utility.types';
import {
  ArdTableCaption,
  ArdTableCell,
  ArdTableCheckbox,
  ArdTableHeaderCell,
  ArdTableHeaderCheckbox,
  ArdTableSubheaderCell,
} from './table.directives';

export interface ArdTableDefaults extends _FocusableComponentDefaults {
  rowDisabledFrom: string;
  rowBoldFrom: string;
  invertRowDisabled: boolean;
  invertRowBold: boolean;
  selectableRows: boolean;
  maxSelectedItems: Nullable<number>;
  clickableRows: boolean;
  caption: Nullable<string>;
  isLoading: boolean;
  loadingProgress: number;
  loadingProgressBuffer: number;
  loadingBarMode: ProgressBarMode;
  loadingBarColor: ComponentColor;
  appearance: TableAppearance;
  variant: TableVariant;
  color: ComponentColor;
  align: TableAlignType;
  headerAlign: TableAlignType;
  compact: boolean;
  zebra: boolean;
  stickyHeader: boolean;
  paginated: boolean;
  paginationStrategy: TablePaginationStrategy;
  paginationOptions: number[] | { value: number; label: string }[];
  totalItems: Nullable<number>;
  paginationColor: ComponentColor;
  paginationAlign: PaginationAlign;
  itemsPerPageText: string;
  currentItemsFormatFn: CurrentItemsFormatFn;
  pageFillRemaining: boolean;
  paginationDisabled: boolean;
  useFirstLastButtons: boolean;
  itemsPerPage: number;
  page: number;
  treatDataSourceAsString: boolean;
  CheckboxComponent?: Type<ArdTableCheckbox>;
  HeaderCheckboxComponent?: Type<ArdTableHeaderCheckbox>;
  CaptionComponent?: Type<ArdTableCaption>;
  CellComponent?: Type<ArdTableCell>;
  HeaderCellComponent?: Type<ArdTableHeaderCell>;
  SubheaderCellComponent?: Type<ArdTableSubheaderCell>;
}

export const _tableDefaults: ArdTableDefaults = {
  ..._focusableComponentDefaults,
  rowDisabledFrom: 'disabled',
  rowBoldFrom: 'bold',
  invertRowDisabled: false,
  invertRowBold: false,
  selectableRows: false,
  maxSelectedItems: undefined,
  clickableRows: false,
  caption: undefined,
  isLoading: false,
  loadingProgress: 0,
  loadingProgressBuffer: 0,
  loadingBarMode: ProgressBarMode.Determinate,
  loadingBarColor: ComponentColor.Secondary,
  appearance: TableAppearance.Strong,
  variant: TableVariant.Rounded,
  color: ComponentColor.Primary,
  align: TableAlignType.CenterLeft,
  headerAlign: TableAlignType.CenterLeft,
  compact: false,
  zebra: false,
  stickyHeader: false,
  paginated: false,
  paginationStrategy: TablePaginationStrategy.Noop,
  paginationOptions: [10, 25, 50],
  totalItems: undefined,
  paginationColor: ComponentColor.None,
  paginationAlign: PaginationAlign.Split,
  itemsPerPageText: 'Items per page:',
  currentItemsFormatFn: ({ currentItemsFrom, currentItemsTo, totalItems }) =>
    `${currentItemsFrom} – ${currentItemsTo} of ${totalItems}`,
  pageFillRemaining: false,
  paginationDisabled: false,
  useFirstLastButtons: false,
  itemsPerPage: 50,
  page: 1,
  treatDataSourceAsString: false,
  CheckboxComponent: undefined,
  HeaderCheckboxComponent: undefined,
  CaptionComponent: undefined,
  CellComponent: undefined,
  HeaderCellComponent: undefined,
  SubheaderCellComponent: undefined,
};

export const ARD_TABLE_DEFAULTS = new InjectionToken<ArdTableDefaults>('ard-table-defaults', {
  factory: () => ({
    ..._tableDefaults,
  }),
});

export function provideTableDefaults(config: Partial<ArdTableDefaults>): Provider {
  return { provide: ARD_TABLE_DEFAULTS, useValue: { ..._tableDefaults, ...config } };
}
