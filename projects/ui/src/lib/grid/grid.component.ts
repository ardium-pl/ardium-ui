import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    effect,
    inject,
    input,
    OnChanges,
    signal,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { ArdiumBreakpointService } from '../breakpoints/breakpoint.service';
import {
    parseBooleanOrBreakpointConfig,
    parseCSSUnitOrBreakpointConfig,
    parseEnumOrBreakpointConfig,
    parseNumberOrBreakpointConfig,
    parseSizeOrBreakpointConfig,
} from '../breakpoints/breakpoint.utils';
import { ArdBreakpointsConfig } from '../breakpoints/breakpoints';
import { ARD_GRID_DEFAULTS } from './grid.defaults';
import {
    ArdGridAlign,
    ArdGridJustify,
    ArdGridSize,
    ArdGridWrap,
    isArdGridAlign,
    isArdGridJustify,
    isArdGridWrap,
} from './grid.types';

@Component({
  selector: 'ard-grid',
  standalone: false,
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ard-grid',
    '[style]': 'currentStyle()',
    '[class.ard-grid__container]': 'container()',
    '[class.ard-grid__item]': '!container()',
    '[class.ard-grid__item-grow]': '!container() && currentSize() === "grow"',
    '[class.ard-grid__item-auto]': '!container() && currentSize() === "auto"',
  },
})
export class ArdiumGridComponent implements AfterContentInit, OnChanges {
  private readonly _componentId = '601';

  protected readonly _DEFAULTS = inject(ARD_GRID_DEFAULTS);

  private readonly _breakpointService = inject(ArdiumBreakpointService);

  constructor() {
    effect(() => {
      this._updateChildrenStyles();
    });
  }

  private _wasContentInitialized = false;
  ngAfterContentInit() {
    this._wasContentInitialized = true;
    this._updateChildrenStyles();
  }

  //! is container
  readonly container = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! configurations
  readonly columns = input<Required<ArdBreakpointsConfig<number>>, number | string | ArdBreakpointsConfig<number>>(
    parseNumberOrBreakpointConfig(this._DEFAULTS.columns, this._breakpointService.breakpoints, this._componentId),
    { transform: value => parseNumberOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId) }
  );
  readonly size = input<
    Required<ArdBreakpointsConfig<number | ArdGridSize>>,
    number | ArdGridSize | string | ArdBreakpointsConfig<number>
  >(parseSizeOrBreakpointConfig(this._DEFAULTS.size, this._breakpointService.breakpoints, this._componentId), {
    transform: value => parseSizeOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId),
  });

  readonly reverse = input<Required<ArdBreakpointsConfig<boolean>>, boolean | string | ArdBreakpointsConfig<boolean>>(
    parseBooleanOrBreakpointConfig(this._DEFAULTS.reverse, this._breakpointService.breakpoints, this._componentId),
    { transform: value => parseBooleanOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId) }
  );

  readonly justifyContent = input<
    Required<ArdBreakpointsConfig<ArdGridJustify>>,
    ArdGridJustify | string | ArdBreakpointsConfig<ArdGridJustify>
  >(parseEnumOrBreakpointConfig(this._DEFAULTS.justifyContent, this._breakpointService.breakpoints, this._componentId, isArdGridJustify), {
    transform: value => parseEnumOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId, isArdGridJustify),
  });

  readonly alignItems = input<
    Required<ArdBreakpointsConfig<ArdGridAlign>>,
    ArdGridAlign | string | ArdBreakpointsConfig<ArdGridAlign>
  >(parseEnumOrBreakpointConfig(this._DEFAULTS.alignItems, this._breakpointService.breakpoints, this._componentId, isArdGridAlign), {
    transform: value => parseEnumOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId, isArdGridAlign),
  });

  readonly spacing = input<
    Required<ArdBreakpointsConfig<number | string>>,
    number | string | ArdBreakpointsConfig<number | string>
  >(parseCSSUnitOrBreakpointConfig(this._DEFAULTS.spacing, this._breakpointService.breakpoints, this._componentId)!, {
    transform: value => parseCSSUnitOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId)!,
  });

  readonly columnSpacing = input<
    ArdBreakpointsConfig<number | string> | null,
    null | number | string | ArdBreakpointsConfig<number | string>
  >(parseCSSUnitOrBreakpointConfig(this._DEFAULTS.columnSpacing, this._breakpointService.breakpoints, this._componentId), {
    transform: value => parseCSSUnitOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId),
  });

  readonly rowSpacing = input<
    ArdBreakpointsConfig<number | string> | null,
    null | number | string | ArdBreakpointsConfig<number | string>
  >(parseCSSUnitOrBreakpointConfig(this._DEFAULTS.rowSpacing, this._breakpointService.breakpoints, this._componentId), {
    transform: value => parseCSSUnitOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId),
  });

  readonly wrap = input<Required<ArdBreakpointsConfig<ArdGridWrap>>, ArdGridWrap | string | ArdBreakpointsConfig<ArdGridWrap>>(
    parseEnumOrBreakpointConfig(this._DEFAULTS.wrap, this._breakpointService.breakpoints, this._componentId, isArdGridWrap),
    { transform: value => parseEnumOrBreakpointConfig(value, this._breakpointService.breakpoints, this._componentId, isArdGridWrap) }
  );

  //! inherited properties
  readonly inheritedColumns = signal<ArdBreakpointsConfig<number> | null>(null);
  readonly inheritedReverse = signal<ArdBreakpointsConfig<boolean> | null>(null);
  readonly inheritedJustifyContent = signal<ArdBreakpointsConfig<ArdGridJustify> | null>(null);
  readonly inheritedAlignItems = signal<ArdBreakpointsConfig<ArdGridAlign> | null>(null);
  readonly inheritedColumnSpacing = signal<ArdBreakpointsConfig<number | string> | null>(null);
  readonly inheritedRowSpacing = signal<ArdBreakpointsConfig<number | string> | null>(null);
  readonly inheritedWrap = signal<ArdBreakpointsConfig<ArdGridWrap> | null>(null);

  readonly wasColumnsChanged = signal<boolean>(false);
  readonly wasReverseChanged = signal<boolean>(false);
  readonly wasJustifyContentChanged = signal<boolean>(false);
  readonly wasAlignItemsChanged = signal<boolean>(false);
  readonly wasColumnSpacingChanged = signal<boolean>(false);
  readonly wasRowSpacingChanged = signal<boolean>(false);
  readonly wasWrapChanged = signal<boolean>(false);

  //! inherited or own properties
  readonly columnsOrInherited = computed(() =>
    this.wasColumnsChanged() ? this.columns() : (this.inheritedColumns() ?? this.columns())
  );
  readonly reverseOrInherited = computed(() =>
    this.wasReverseChanged() ? this.reverse() : (this.inheritedReverse() ?? this.reverse())
  );
  readonly justifyContentOrInherited = computed(() =>
    this.wasJustifyContentChanged() ? this.justifyContent() : (this.inheritedJustifyContent() ?? this.justifyContent())
  );
  readonly alignItemsOrInherited = computed(() =>
    this.wasAlignItemsChanged() ? this.alignItems() : (this.inheritedAlignItems() ?? this.alignItems())
  );
  readonly columnSpacingOrInherited = computed(() =>
    this.wasColumnSpacingChanged() ? this.columnSpacing() : (this.inheritedColumnSpacing() ?? this.columnSpacing())
  );
  readonly rowSpacingOrInherited = computed(() =>
    this.wasRowSpacingChanged() ? this.rowSpacing() : (this.inheritedRowSpacing() ?? this.rowSpacing())
  );
  readonly wrapOrInherited = computed(() => (this.wasWrapChanged() ? this.wrap() : (this.inheritedWrap() ?? this.wrap())));

  //! computed properties
  readonly finalColumnSpacing = computed(() => this.columnSpacingOrInherited() ?? this.spacing());
  readonly finalRowSpacing = computed(() => this.rowSpacingOrInherited() ?? this.spacing());

  //! current values
  readonly currentColumns = computed(() => this.columnsOrInherited()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentSize = computed(() => this.size()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentReverse = computed(() => this.reverseOrInherited()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentJustifyContent = computed(
    () => this.justifyContentOrInherited()[this._breakpointService.currentBreakpoint() ?? 'xs']
  );
  readonly currentAlignItems = computed(() => this.alignItemsOrInherited()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentColumnSpacing = computed(() => this.finalColumnSpacing()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentRowSpacing = computed(() => this.finalRowSpacing()[this._breakpointService.currentBreakpoint() ?? 'xs']);
  readonly currentWrap = computed(() => this.wrapOrInherited()[this._breakpointService.currentBreakpoint() ?? 'xs']);

  readonly currentInheritedColumns = computed(
    () => this.inheritedColumns()?.[this._breakpointService.currentBreakpoint() ?? 'xs']
  );
  readonly currentInheritedColumnSpacing = computed(
    () => this.inheritedColumnSpacing()?.[this._breakpointService.currentBreakpoint() ?? 'xs']
  );
  readonly currentInheritedRowSpacing = computed(
    () => this.inheritedRowSpacing()?.[this._breakpointService.currentBreakpoint() ?? 'xs']
  );

  readonly currentStyle = computed(() =>
    [
      this.currentSize() ? `--ard-_grid-size: ${this.currentSize()}` : '',

      this.currentInheritedColumns() ? `--ard-_grid-parent-columns: ${this.currentInheritedColumns()}` : '',
      this.currentInheritedColumnSpacing() ? `--ard-_grid-parent-column-spacing: ${this.currentInheritedColumnSpacing()}` : '',
      this.currentInheritedRowSpacing() ? `--ard-_grid-parent-row-spacing: ${this.currentInheritedRowSpacing()}` : '',

      this.container() ? `--ard-_grid-columns: ${this.currentColumns()}` : '',
      this.container() ? `--ard-_grid-direction: ${this.currentReverse() ? 'row-reverse' : 'row'}` : '',
      this.container() ? `--ard-_grid-justify-content: ${this.currentJustifyContent()}` : '',
      this.container() ? `--ard-_grid-align-items: ${this.currentAlignItems()}` : '',
      this.container() ? `--ard-_grid-column-spacing: ${this.currentColumnSpacing()}` : '',
      this.container() ? `--ard-_grid-row-spacing: ${this.currentRowSpacing()}` : '',
      this.container() ? `--ard-_grid-wrap: ${this.currentWrap()}` : '',
    ]
      .filter(Boolean)
      .join(';')
  );

  //! inheriting styles for items
  readonly children = contentChildren(ArdiumGridComponent);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.wasColumnsChanged.set(true);
    }
    if (changes['reverse']) {
      this.wasReverseChanged.set(true);
    }
    if (changes['justifyContent']) {
      this.wasJustifyContentChanged.set(true);
    }
    if (changes['alignItems']) {
      this.wasAlignItemsChanged.set(true);
    }
    if (changes['columnSpacing']) {
      this.wasColumnSpacingChanged.set(true);
    }
    if (changes['rowSpacing']) {
      this.wasRowSpacingChanged.set(true);
    }
    if (changes['wrap']) {
      this.wasWrapChanged.set(true);
    }
  }

  private _updateChildrenStyles() {
    const children = this.children();

    const columns = this.columnsOrInherited();
    const reverse = this.reverseOrInherited();
    const justifyContent = this.justifyContentOrInherited();
    const alignItems = this.alignItemsOrInherited();
    const columnSpacing = this.finalColumnSpacing();
    const rowSpacing = this.finalRowSpacing();
    const wrap = this.wrapOrInherited();

    if (!this._wasContentInitialized) {
      return;
    }

    for (const child of children) {
      child.inheritedColumns.set(columns);
      child.inheritedReverse.set(reverse);
      child.inheritedJustifyContent.set(justifyContent);
      child.inheritedAlignItems.set(alignItems);
      child.inheritedColumnSpacing.set(columnSpacing);
      child.inheritedRowSpacing.set(rowSpacing);
      child.inheritedWrap.set(wrap);
    }
  }
}
