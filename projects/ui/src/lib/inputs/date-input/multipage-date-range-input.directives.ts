import { Directive, TemplateRef } from '@angular/core';
import { CalendarDayContext, CalendarDaysViewHeaderContext, CalendarFloatingMonthContext, CalendarMonthContext, CalendarMonthsViewHeaderContext, CalendarWeekdayContext, CalendarYearContext, CalendarYearsViewHeaderContext } from '../../calendar';
import { FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdDateInputAcceptButtonsContext, ArdDateInputValueContext } from './date-input.types';

//public (exported)

@Directive({ standalone: false, selector: 'ard-multipage-date-range-input > ng-template[ard-prefix-tmp]' })
export class ArdMultipageDateRangeInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-multipage-date-range-input > ng-template[ard-suffix-tmp]' })
export class ArdMultipageDateRangeInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-multipage-date-range-input > ng-template[ard-value-tmp]' })
export class ArdMultipageDateRangeInputValueTemplateDirective {
  constructor(public template: TemplateRef<ArdDateInputValueContext<Date>>) {}
}

@Directive({ standalone: false, selector: 'ard-multipage-date-range-input > ng-template[ard-date-input-icon-tmp]' })
export class ArdMultipageDateRangeInputCalendarIconTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-multipage-date-range-input > ng-template[ard-accept-buttons-tmp]' })
export class ArdMultipageDateRangeInputAcceptButtonsTemplateDirective {
  constructor(public template: TemplateRef<ArdDateInputAcceptButtonsContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-header-tmp]',
})
export class ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarDaysViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-year-picker-header-tmp]',
})
export class ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarYearsViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-month-picker-header-tmp]',
})
export class ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarMonthsViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-weekday-tmp]',
})
export class ArdMultipageDateRangeInputWeekdayTemplateDirective {
  constructor(public template: TemplateRef<CalendarWeekdayContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-floating-month-tmp]',
})
export class ArdMultipageDateRangeInputFloatingMonthTemplateDirective {
  constructor(public template: TemplateRef<CalendarFloatingMonthContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-year-tmp]',
})
export class ArdMultipageDateRangeInputYearTemplateDirective {
  constructor(public template: TemplateRef<CalendarYearContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-month-tmp]',
})
export class ArdMultipageDateRangeInputMonthTemplateDirective {
  constructor(public template: TemplateRef<CalendarMonthContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-multipage-date-range-input > ng-template[ard-day-tmp]',
})
export class ArdMultipageDateRangeInputDayTemplateDirective {
  constructor(public template: TemplateRef<CalendarDayContext>) {}
}
