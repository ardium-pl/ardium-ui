import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumClickOutsideModule } from '@ardium-pl/devkit';
import { ArdiumButtonModule } from '../../buttons/button';
import { ArdiumIconButtonModule } from '../../buttons/icon-button';
import { ArdiumRangeCalendarModule } from '../../calendar';
import { _CalendarTemplateRepositoryDirective } from '../../calendar/calendar.internal-directives';
import { ArdiumDropdownPanelModule } from '../../dropdown-panel/dropdown-panel.module';
import { ArdiumFormFieldFrameModule } from '../../form-field-frame/form-field-frame.module';
import { ArdiumIconModule } from '../../icon';
import { ArdiumMultipageDateRangeInputComponent } from './multipage-date-range-input.component';
import {
    ArdMultipageDateRangeInputAcceptButtonsTemplateDirective,
    ArdMultipageDateRangeInputCalendarIconTemplateDirective,
    ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputDayTemplateDirective,
    ArdMultipageDateRangeInputFloatingMonthTemplateDirective,
    ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputMonthTemplateDirective,
    ArdMultipageDateRangeInputPrefixTemplateDirective,
    ArdMultipageDateRangeInputSuffixTemplateDirective,
    ArdMultipageDateRangeInputValueTemplateDirective,
    ArdMultipageDateRangeInputWeekdayTemplateDirective,
    ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputYearTemplateDirective,
} from './multipage-date-range-input.directives';

@NgModule({
  declarations: [
    ArdiumMultipageDateRangeInputComponent,
    //template directives
    ArdMultipageDateRangeInputPrefixTemplateDirective,
    ArdMultipageDateRangeInputSuffixTemplateDirective,
    ArdMultipageDateRangeInputValueTemplateDirective,
    ArdMultipageDateRangeInputCalendarIconTemplateDirective,
    ArdMultipageDateRangeInputAcceptButtonsTemplateDirective,
    ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputDayTemplateDirective,
    ArdMultipageDateRangeInputFloatingMonthTemplateDirective,
    ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputMonthTemplateDirective,
    ArdMultipageDateRangeInputWeekdayTemplateDirective,
    ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputYearTemplateDirective,
  ],
  imports: [
    CommonModule,
    ArdiumFormFieldFrameModule,
    ArdiumDropdownPanelModule,
    ArdiumClickOutsideModule,
    ArdiumRangeCalendarModule,
    ArdiumIconButtonModule,
    ArdiumButtonModule,
    ArdiumIconModule,
    _CalendarTemplateRepositoryDirective,
  ],
  exports: [
    ArdiumMultipageDateRangeInputComponent,
    //tempalate directives
    ArdMultipageDateRangeInputPrefixTemplateDirective,
    ArdMultipageDateRangeInputSuffixTemplateDirective,
    ArdMultipageDateRangeInputValueTemplateDirective,
    ArdMultipageDateRangeInputCalendarIconTemplateDirective,
    ArdMultipageDateRangeInputAcceptButtonsTemplateDirective,
    ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputDayTemplateDirective,
    ArdMultipageDateRangeInputFloatingMonthTemplateDirective,
    ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputMonthTemplateDirective,
    ArdMultipageDateRangeInputWeekdayTemplateDirective,
    ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective,
    ArdMultipageDateRangeInputYearTemplateDirective,
  ],
  providers: [
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0000' } },
  ],
})
export class ArdiumMultipageDateRangeInputModule {}
