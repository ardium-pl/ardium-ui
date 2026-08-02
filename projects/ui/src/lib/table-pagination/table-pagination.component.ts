import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
  computed,
  input,
  model
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { _FocusableComponentBase } from '../_internal/focusable-component';
import { PaginationModel } from '../_internal/models/pagination.model';
import { ComponentColor } from '../types/colors.types';
import { ARD_TABLE_PAGINATION_DEFAULTS, ArdTablePaginationDefaults } from './table-pagination.defaults';
import { CurrentItemsFormatFn, PaginationAlign } from './table-pagination.types';

@Component({
  standalone: false,
  selector: 'ard-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumTablePaginationComponent extends _FocusableComponentBase implements OnInit {
  protected override readonly _DEFAULTS!: ArdTablePaginationDefaults;
  constructor(@Inject(ARD_TABLE_PAGINATION_DEFAULTS) defaults: ArdTablePaginationDefaults) {
    super(defaults);
  }

  readonly componentId = '506';

  private readonly _pagination = new PaginationModel(this);

  //! main settings
  readonly totalItems = input.required<number>();
  readonly options = input<number[] | { value: number; label: string }[]>([10, 25, 50]);
  readonly itemsPerPage = model<number>(50);
  readonly page = model<number>(1);

  ngOnInit(): void {
    if (this._pagination.isTotalItemsDefined()) return;
    throw new Error('ARD-FT5060: Table pagination requires [totalItems] to be defined.');
  }

  //! appearance
  readonly color = input<ComponentColor>(ComponentColor.Primary);
  readonly align = input<PaginationAlign>(PaginationAlign.Split);

  readonly compact = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [`ard-color-${this.color()}`, `ard-align-${this.align()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! miscellaneous
  readonly useFirstLastButtons = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly isLoading = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly itemsPerPageText = input<string>('Items per page:');

  readonly currentItemsFormatFn = input<CurrentItemsFormatFn>(
    ({ currentItemsFrom: currentItemsFirst, currentItemsTo: currentItemsLast, totalItems }) =>
      `${currentItemsFirst} – ${currentItemsLast} of ${totalItems}`
  );

  //! contexts
  readonly getCurrentItemsContext = this._pagination.getCurrentItemsContext;

  readonly firstPageDisabled = this._pagination.firstPageDisabled;
  readonly lastPageDisabled = this._pagination.lastPageDisabled;

  //! methods
  onItemsPerPageChange(newValue: number): void {
    if (this.isLoading()) return;
    if (newValue === this.itemsPerPage()) return;
    this.itemsPerPage.set(newValue);
  }
  onPageChange(newPage: number): void {
    if (this.isLoading()) return;
    if (newPage === this.page()) return;
    this._pagination.setPage(newPage);
  }
  onFirstPage(): void {
    if (this.isLoading()) return;
    this._pagination.goToFirstPage();
  }
  onPrevPage(): void {
    if (this.isLoading()) return;
    this._pagination.goToPrevPage();
  }
  onNextPage(): void {
    if (this.isLoading()) return;
    this._pagination.goToNextPage();
  }
  onLastPage(): void {
    if (this.isLoading()) return;
    this._pagination.goToLastPage();
  }
}
