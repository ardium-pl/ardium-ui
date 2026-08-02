import { Overlay, OverlayConfig, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  model,
  OnDestroy,
  output,
  Signal,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, coerceDateOnlyProperty, coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { _FormFieldComponentBase } from '../../_internal/form-field-component';
import {
  ArdCalendarDaysViewHeaderTemplateDirective,
  ArdCalendarDayTemplateDirective,
  ArdCalendarFilterFn,
  ArdCalendarFloatingMonthTemplateDirective,
  ArdCalendarMonthsViewHeaderTemplateDirective,
  ArdCalendarMonthTemplateDirective,
  ArdCalendarView,
  ArdCalendarWeekdayTemplateDirective,
  ArdCalendarYearsViewHeaderTemplateDirective,
  ArdCalendarYearTemplateDirective,
} from '../../calendar';
import { ArdiumDropdownPanelComponent, DropdownPanelAppearance, DropdownPanelVariant } from '../../dropdown-panel';
import { ComponentColor } from '../../types/colors.types';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { Nullable } from '../../types/utility.types';
import { ArdDateInputDefaults } from './date-input.defaults';
import {
  ArdDateInputAcceptButtonsTemplateDirective,
  ArdDateInputCalendarIconTemplateDirective,
  ArdDateInputValueTemplateDirective
} from './date-input.directives';
import { ArdDateInputAcceptButtonsContext, ArdDateInputSerializeFn, ArdDateInputValueContext } from './date-input.types';

@Directive()
export abstract class _AbstractDateInput<T, PT = T> extends _FormFieldComponentBase implements OnDestroy, ControlValueAccessor {
  abstract readonly componentId: string;
  abstract readonly componentName: string;

  abstract readonly isRangeSelector: boolean;

  protected override readonly _DEFAULTS!: ArdDateInputDefaults;
  constructor(defaults: ArdDateInputDefaults) {
    super(defaults);

    // emit value whenever it changes
    effect(() => {
      if (!this._isFullValue(this.value())) return;
      this._emitChange();
    });
  }

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly scrollStrategyOpts = inject(ScrollStrategyOptions);

  readonly placeholder = input<string>(this._DEFAULTS.placeholder);

  readonly calendarDisabled = input<boolean, BooleanLike>(this._DEFAULTS.calendarDisabled, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly calendarHidden = input<boolean, BooleanLike>(this._DEFAULTS.calendarHidden, {
    transform: v => coerceBooleanProperty(v),
  });

  //! serialization
  abstract readonly serializeFn: InputSignal<ArdDateInputSerializeFn<PT>>;

  //! control value accessor
  readonly value = model<PT | null>(null);

  abstract override writeValue(value: T | null): void;

  //! change & touch event emitters
  protected _emitChange(): void {
    this._onChangeRegistered?.(this.getValueForEmit());
  }

  protected abstract getValueForEmit(): T | null;

  //! output events
  readonly isOpen = model<boolean>(false);

  readonly openEvent = output<void>({ alias: 'open' });
  readonly closeEvent = output<void>({ alias: 'close' });

  //! computed properties
  abstract readonly shouldDisplayPlaceholder: Signal<boolean>;
  abstract readonly shouldDisplayValue: Signal<boolean>;
  abstract readonly shouldDisplayDateInput: Signal<boolean>;

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [
      //appearance and variant handled in ard-form-field-frame component
      //color handled in ard-calendar component
      this.compact() ? 'ard-compact' : '',
      this.isOpen() ? 'ard-dropdown-open' : '',
    ].join(' ')
  );

  readonly dropdownAppearance = input<Nullable<DropdownPanelAppearance>>(this._DEFAULTS.dropdownAppearance);
  readonly dropdownAppearanceOrDefault = computed(() => {
    if (this.dropdownAppearance()) return this.dropdownAppearance()!;
    if (this.appearance() === FormElementAppearance.Outlined) return DropdownPanelAppearance.Outlined;
    return DropdownPanelAppearance.Raised;
  });
  readonly dropdownVariant = input<Nullable<DropdownPanelVariant>>(this._DEFAULTS.dropdownVariant);
  readonly dropdownVariantOrDefault = computed(() => {
    if (this.dropdownVariant()) return this.dropdownVariant()!;
    const variant = this.variant();
    if (variant === FormElementVariant.Pill) return DropdownPanelVariant.Rounded;
    return variant;
  });

  //! calendar attributes
  readonly activeView = model<ArdCalendarView>(this._DEFAULTS.activeView);
  readonly startView = input<Nullable<ArdCalendarView>>(this._DEFAULTS.startView);

  readonly activeYear = model<number>(this._DEFAULTS.activeYear);
  readonly activeMonth = model<number>(this._DEFAULTS.activeMonth);

  readonly firstWeekday = input<number, NumberLike>(this._DEFAULTS.firstWeekday, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.firstWeekday);
      if (!Number.isInteger(value)) {
        console.error(
          new Error(`ARD-NF0081A: [firstWeekday] must be a positive integer, got "${value}". Using default value instead.`)
        );
        return this._DEFAULTS.firstWeekday;
      }
      if (value < 0 || value > 6) {
        console.error(
          new Error(
            `ARD-WA0081B: [firstWeekday] must be between 0 and 6, got "${value}". Using modulo operator to adjust the value.`
          )
        );
      }
      return value % 7;
    },
  });

  readonly multipleYearPageChangeModifier = input<number, NumberLike>(this._DEFAULTS.multipleYearPageChangeModifier, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.multipleYearPageChangeModifier);
      if (!Number.isInteger(value) || value < 1) {
        console.error(
          new Error(
            `ARD-NF0082: [multipleYearPageChangeModifier] must be a positive integer, got "${value}". Using default value instead.`
          )
        );
        return this._DEFAULTS.multipleYearPageChangeModifier;
      }
      return value;
    },
  });

  readonly min = input<Date | null, any>(this._DEFAULTS.min, {
    transform: v => (v === null ? null : coerceDateOnlyProperty(v, this._DEFAULTS.min, true)),
  });
  readonly max = input<Date | null, any>(this._DEFAULTS.max, {
    transform: v => (v === null ? null : coerceDateOnlyProperty(v, this._DEFAULTS.max, true)),
  });

  readonly UTC = input<boolean, BooleanLike>(this._DEFAULTS.UTC, { transform: v => coerceBooleanProperty(v) });
  readonly _UTCAfterInit = signal<boolean>(this._DEFAULTS.UTC);

  readonly filter = input<ArdCalendarFilterFn | null>(this._DEFAULTS.filter);

  readonly hideFloatingMonth = input<boolean, BooleanLike>(this._DEFAULTS.hideFloatingMonth, {
    transform: v => coerceBooleanProperty(v),
  });

  //! lifecycle hooks
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['UTC']) {
      if (changes['UTC'].firstChange) {
        this._UTCAfterInit.set(changes['UTC'].currentValue);
      } else {
        console.error(
          `ARD-NF0084: <ard-date-input>'s [UTC] attribute should not be changed dynamically. This change will be ignored.`
        );
      }
    }
  }

  //! calendar outputs
  readonly yearSelect = output<number>();
  readonly monthSelect = output<number>();

  //! calendar controls
  readonly useAcceptButtonToSelect = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  private _valueToAccept: PT | null = null;

  onCalendarSelectedChange(value: PT | null): void {
    if (this.disabled() || this.readonly()) return;
    if (!value) return;
    if (this.useAcceptButtonToSelect()) {
      this._valueToAccept = value;
      return;
    }
    this._acceptSelectedDate(value);
  }
  private _acceptSelectedDate(date: PT | null): void {
    this.value.set(date);
    if (this._isFullValue(date)) {
      this.close();
    }
  }
  private _cancelCalendarSelection(): void {
    this.close();
  }
  protected abstract _isFullValue(value: PT | T | null): value is T;

  onAcceptButtonClick(): void {
    if (this.disabled() || this.readonly()) return;
    this._acceptSelectedDate(this._valueToAccept);
    this._valueToAccept = null;
  }
  onCancelButtonClick(): void {
    if (this.disabled() || this.readonly()) return;
    this._cancelCalendarSelection();
  }

  //! dropdown overlay
  readonly dropdownHost = viewChild.required<ElementRef<HTMLElement>>('dropdownHost');
  readonly dropdownTemplate = viewChild.required<TemplateRef<any>>('dropdownTemplate');
  readonly dropdownPanel = viewChild.required<ArdiumDropdownPanelComponent>(ArdiumDropdownPanelComponent);

  private dropdownOverlay?: OverlayRef;

  private _createOverlay(): void {
    const strategy = this.overlay
      .position()
      .flexibleConnectedTo(this.dropdownHost())
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ]);

    const config = new OverlayConfig({
      positionStrategy: strategy,
      scrollStrategy: this.scrollStrategyOpts.block(),
      hasBackdrop: false,
    });

    this.dropdownOverlay = this.overlay.create(config);

    const portal = new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef);
    this.dropdownOverlay.attach(portal);
  }
  private _destroyOverlay(): void {
    if (!this.dropdownOverlay) return;

    this.dropdownOverlay.dispose();
    delete this.dropdownOverlay;
  }

  //! dropdown state handlers
  onGeneralClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    const target = event.target as HTMLElement;
    if (target.tagName !== 'INPUT') {
      event.preventDefault();
    }
  }
  onOutsideClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (this.elementRef.nativeElement.contains(target)) return;

    this.close();
  }
  onCalendarButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (this.calendarDisabled()) return;
    if (this.calendarHidden()) return;
    event.preventDefault();
    event.stopPropagation();

    this.toggle();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.open();
  }
  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) return;

    const startView = this.startView();
    if (startView) {
      this.activeView.set(startView);
    }

    this.isOpen.set(true);

    this._createOverlay();
    this.openEvent.emit();
  }
  close(): void {
    if (this.disabled() || this.readonly() || !this.isOpen()) return;

    this.isOpen.set(false);

    this._destroyOverlay();
    this.closeEvent.emit();
  }

  //! templates
  readonly valueTemplate = contentChild(ArdDateInputValueTemplateDirective);
  readonly calendarIconTemplate = contentChild(ArdDateInputCalendarIconTemplateDirective);
  readonly acceptButtonsTemplate = contentChild(ArdDateInputAcceptButtonsTemplateDirective);

  abstract readonly calendarYearsViewHeaderTemplate: Signal<ArdCalendarYearsViewHeaderTemplateDirective | undefined>;
  abstract readonly calendarMonthsViewHeaderTemplate: Signal<ArdCalendarMonthsViewHeaderTemplateDirective | undefined>;
  abstract readonly calendarDaysViewHeaderTemplate: Signal<ArdCalendarDaysViewHeaderTemplateDirective | undefined>;
  abstract readonly calendarWeekdayTemplate: Signal<ArdCalendarWeekdayTemplateDirective | undefined>;
  abstract readonly calendarFloatingMonthTemplate: Signal<ArdCalendarFloatingMonthTemplateDirective | undefined>;
  abstract readonly calendarYearTemplate: Signal<ArdCalendarYearTemplateDirective | undefined>;
  abstract readonly calendarMonthTemplate: Signal<ArdCalendarMonthTemplateDirective | undefined>;
  abstract readonly calendarDayTemplate: Signal<ArdCalendarDayTemplateDirective | undefined>;

  //! template customizations
  readonly calendarDaysViewHeaderDateFormat = input<string>(this._DEFAULTS.calendarDaysViewHeaderDateFormat); // 'MMM YYYY'
  readonly calendarYearsViewHeaderDateFormat = input<string>(this._DEFAULTS.calendarYearsViewHeaderDateFormat); // 'YYYY'
  readonly calendarMonthsViewHeaderDateFormat = input<string>(this._DEFAULTS.calendarMonthsViewHeaderDateFormat); // 'YYYY'
  readonly calendarWeekdayDateFormat = input<string>(this._DEFAULTS.calendarWeekdayDateFormat); // 'EEEEE'
  readonly calendarWeekdayTitleDateFormat = input<string>(this._DEFAULTS.calendarWeekdayTitleDateFormat); // 'EEEE'
  readonly calendarFloatingMonthDateFormat = input<string>(this._DEFAULTS.calendarFloatingMonthDateFormat); // 'LLL'
  readonly calendarFloatingMonthTitleDateFormat = input<string>(this._DEFAULTS.calendarFloatingMonthTitleDateFormat); // 'LLLL'
  readonly calendarYearDateFormat = input<string>(this._DEFAULTS.calendarYearDateFormat); // 'YYYY'
  readonly calendarMonthDateFormat = input<string>(this._DEFAULTS.calendarMonthDateFormat); // 'MMM'
  readonly calendarDayDateFormat = input<string>(this._DEFAULTS.calendarDayDateFormat); // 'D'

  readonly acceptButtonText = input<string>(this._DEFAULTS.acceptButtonText);
  readonly cancelButtonText = input<string>(this._DEFAULTS.cancelButtonText);

  //! context providers
  readonly valueContext = computed<ArdDateInputValueContext<PT>>(() => ({
    $implicit: this.serializeFn()(this.value()),
    rawValue: this.value(),
  }));

  readonly acceptButtonsContext = computed<ArdDateInputAcceptButtonsContext>(() => ({
    $implicit: () => this.onAcceptButtonClick(),
    accept: () => this.onAcceptButtonClick(),
    cancel: () => this.onCancelButtonClick(),
    disabled: this.disabled() || this.calendarDisabled(),
  }));
}
