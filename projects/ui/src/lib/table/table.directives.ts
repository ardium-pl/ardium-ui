import { Directive, TemplateRef, input } from '@angular/core';
import { PaginationContext } from '../_internal/models/pagination.model';
import { Nullable, TemplateComponent } from '../types/utility.types';
import {
  TableCaptionContext,
  TableCellContext,
  TableCheckboxContext,
  TableHeaderContext,
  TableSubheaderContext,
} from './table.types';

@Directive({ standalone: false, selector: 'ard-table > ng-template[ard-table-tmp]' })
export class ArdiumTableTemplateDirective {
  readonly name = input.required<Nullable<string>>({ alias: 'ard-table-tmp' });

  constructor(public template: TemplateRef<any>) {}
}

@Directive({ standalone: false, selector: 'ard-table > ng-template[ard-table-checkbox-tmp]' })
export class ArdiumTableCheckboxTemplateDirective {
  constructor(public template: TemplateRef<TableCheckboxContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-table > ng-template[ard-table-header-checkbox-tmp]',
})
export class ArdiumTableHeaderCheckboxTemplateDirective {
  constructor(public template: TemplateRef<TableCheckboxContext>) {}
}

@Directive({ standalone: false, selector: 'ard-table > ng-template[ard-table-caption-tmp]' })
export class ArdiumTableCaptionTemplateDirective {
  constructor(public template: TemplateRef<TableCaptionContext>) {}
}

@Directive({ standalone: false, selector: 'ard-table > ng-template[ard-table-pagination-tmp]' })
export class ArdiumTablePaginationTemplateDirective {
  constructor(public template: TemplateRef<PaginationContext>) {}
}

export interface ArdTableCheckbox extends TemplateComponent<TableCheckboxContext> {}
export interface ArdTableHeaderCheckbox extends TemplateComponent<TableCheckboxContext> {}
export interface ArdTableCaption extends TemplateComponent<TableCaptionContext> {}
export interface ArdTableCell extends TemplateComponent<TableCellContext> {}
export interface ArdTableHeaderCell extends TemplateComponent<TableHeaderContext> {}
export interface ArdTableSubheaderCell extends TemplateComponent<TableSubheaderContext> {}
