import { Directive, TemplateRef } from '@angular/core';
import { CalendarDayContext, CalendarDaysViewHeaderContext, CalendarFloatingMonthContext, CalendarMonthContext, CalendarMonthsViewHeaderContext, CalendarWeekdayContext, CalendarYearContext, CalendarYearsViewHeaderContext } from '../../calendar';
import { FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdDateInputAcceptButtonsContext, ArdDateInputValueContext } from './date-input.types';

//public (exported)

@Directive({ standalone: false, selector: 'ard-date-range-input > ng-template[ard-prefix-tmp]' })
export class ArdDateRangeInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-date-range-input > ng-template[ard-suffix-tmp]' })
export class ArdDateRangeInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-date-range-input > ng-template[ard-value-tmp]' })
export class ArdDateRangeInputValueTemplateDirective {
  constructor(public template: TemplateRef<ArdDateInputValueContext<Date>>) {}
}

@Directive({ standalone: false, selector: 'ard-date-range-input > ng-template[ard-date-input-icon-tmp]' })
export class ArdDateRangeInputCalendarIconTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-date-range-input > ng-template[ard-accept-buttons-tmp]' })
export class ArdDateRangeInputAcceptButtonsTemplateDirective {
  constructor(public template: TemplateRef<ArdDateInputAcceptButtonsContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-header-tmp]',
})
export class ArdDateRangeInputDaysViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarDaysViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-year-picker-header-tmp]',
})
export class ArdDateRangeInputYearsViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarYearsViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-month-picker-header-tmp]',
})
export class ArdDateRangeInputMonthsViewHeaderTemplateDirective {
  constructor(public template: TemplateRef<CalendarMonthsViewHeaderContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-weekday-tmp]',
})
export class ArdDateRangeInputWeekdayTemplateDirective {
  constructor(public template: TemplateRef<CalendarWeekdayContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-floating-month-tmp]',
})
export class ArdDateRangeInputFloatingMonthTemplateDirective {
  constructor(public template: TemplateRef<CalendarFloatingMonthContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-year-tmp]',
})
export class ArdDateRangeInputYearTemplateDirective {
  constructor(public template: TemplateRef<CalendarYearContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-month-tmp]',
})
export class ArdDateRangeInputMonthTemplateDirective {
  constructor(public template: TemplateRef<CalendarMonthContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-date-range-input > ng-template[ard-day-tmp]',
})
export class ArdDateRangeInputDayTemplateDirective {
  constructor(public template: TemplateRef<CalendarDayContext>) {}
}
