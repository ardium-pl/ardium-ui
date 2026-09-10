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
import { ArdiumDateRangeInputComponent } from './date-range-input.component';
import {
    ArdDateRangeInputAcceptButtonsTemplateDirective,
    ArdDateRangeInputCalendarIconTemplateDirective,
    ArdDateRangeInputDaysViewHeaderTemplateDirective,
    ArdDateRangeInputDayTemplateDirective,
    ArdDateRangeInputFloatingMonthTemplateDirective,
    ArdDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdDateRangeInputMonthTemplateDirective,
    ArdDateRangeInputPrefixTemplateDirective,
    ArdDateRangeInputSuffixTemplateDirective,
    ArdDateRangeInputValueTemplateDirective,
    ArdDateRangeInputWeekdayTemplateDirective,
    ArdDateRangeInputYearsViewHeaderTemplateDirective,
    ArdDateRangeInputYearTemplateDirective,
} from './date-range-input.directives';

@NgModule({
  declarations: [
    ArdiumDateRangeInputComponent,
    //template directives
    ArdDateRangeInputPrefixTemplateDirective,
    ArdDateRangeInputSuffixTemplateDirective,
    ArdDateRangeInputValueTemplateDirective,
    ArdDateRangeInputCalendarIconTemplateDirective,
    ArdDateRangeInputAcceptButtonsTemplateDirective,
    ArdDateRangeInputDaysViewHeaderTemplateDirective,
    ArdDateRangeInputDayTemplateDirective,
    ArdDateRangeInputFloatingMonthTemplateDirective,
    ArdDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdDateRangeInputMonthTemplateDirective,
    ArdDateRangeInputWeekdayTemplateDirective,
    ArdDateRangeInputYearsViewHeaderTemplateDirective,
    ArdDateRangeInputYearTemplateDirective,
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
    ArdiumDateRangeInputComponent,
    //tempalate directives
    ArdDateRangeInputPrefixTemplateDirective,
    ArdDateRangeInputSuffixTemplateDirective,
    ArdDateRangeInputValueTemplateDirective,
    ArdDateRangeInputCalendarIconTemplateDirective,
    ArdDateRangeInputAcceptButtonsTemplateDirective,
    ArdDateRangeInputDaysViewHeaderTemplateDirective,
    ArdDateRangeInputDayTemplateDirective,
    ArdDateRangeInputFloatingMonthTemplateDirective,
    ArdDateRangeInputMonthsViewHeaderTemplateDirective,
    ArdDateRangeInputMonthTemplateDirective,
    ArdDateRangeInputWeekdayTemplateDirective,
    ArdDateRangeInputYearsViewHeaderTemplateDirective,
    ArdDateRangeInputYearTemplateDirective,
  ],
  providers: [
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0000' } },
  ],
})
export class ArdiumDateRangeInputModule {}
