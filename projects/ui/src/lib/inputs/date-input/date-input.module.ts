import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumClickOutsideModule } from '@ardium-pl/devkit';
import { ArdiumButtonModule } from '../../buttons/button';
import { ArdiumIconButtonModule } from '../../buttons/icon-button';
import { ArdiumCalendarModule } from '../../calendar';
import { _CalendarTemplateRepositoryDirective } from '../../calendar/calendar.internal-directives';
import { ArdiumDropdownPanelModule } from '../../dropdown-panel/dropdown-panel.module';
import { ArdiumFormFieldFrameModule } from '../../form-field-frame/form-field-frame.module';
import { ArdiumIconModule } from '../../icon';
import { ArdiumDateInputComponent } from './date-input.component';
import {
    ArdDateInputAcceptButtonsTemplateDirective,
    ArdDateInputCalendarIconTemplateDirective,
    ArdDateInputDaysViewHeaderTemplateDirective,
    ArdDateInputDayTemplateDirective,
    ArdDateInputFloatingMonthTemplateDirective,
    ArdDateInputMonthsViewHeaderTemplateDirective,
    ArdDateInputMonthTemplateDirective,
    ArdDateInputPrefixTemplateDirective,
    ArdDateInputSuffixTemplateDirective,
    ArdDateInputValueTemplateDirective,
    ArdDateInputWeekdayTemplateDirective,
    ArdDateInputYearsViewHeaderTemplateDirective,
    ArdDateInputYearTemplateDirective,
} from './date-input.directives';

@NgModule({
  declarations: [
    ArdiumDateInputComponent,
    //template directives
    ArdDateInputPrefixTemplateDirective,
    ArdDateInputSuffixTemplateDirective,
    ArdDateInputValueTemplateDirective,
    ArdDateInputCalendarIconTemplateDirective,
    ArdDateInputAcceptButtonsTemplateDirective,
    ArdDateInputDaysViewHeaderTemplateDirective,
    ArdDateInputDayTemplateDirective,
    ArdDateInputFloatingMonthTemplateDirective,
    ArdDateInputMonthsViewHeaderTemplateDirective,
    ArdDateInputMonthTemplateDirective,
    ArdDateInputWeekdayTemplateDirective,
    ArdDateInputYearsViewHeaderTemplateDirective,
    ArdDateInputYearTemplateDirective,
  ],
  imports: [
    CommonModule,
    ArdiumFormFieldFrameModule,
    ArdiumDropdownPanelModule,
    ArdiumClickOutsideModule,
    ArdiumCalendarModule,
    ArdiumIconButtonModule,
    ArdiumButtonModule,
    ArdiumIconModule,
    _CalendarTemplateRepositoryDirective,
  ],
  exports: [
    ArdiumDateInputComponent,
    //tempalate directives
    ArdDateInputPrefixTemplateDirective,
    ArdDateInputSuffixTemplateDirective,
    ArdDateInputValueTemplateDirective,
    ArdDateInputCalendarIconTemplateDirective,
    ArdDateInputAcceptButtonsTemplateDirective,
    ArdDateInputDaysViewHeaderTemplateDirective,
    ArdDateInputDayTemplateDirective,
    ArdDateInputFloatingMonthTemplateDirective,
    ArdDateInputMonthsViewHeaderTemplateDirective,
    ArdDateInputMonthTemplateDirective,
    ArdDateInputWeekdayTemplateDirective,
    ArdDateInputYearsViewHeaderTemplateDirective,
    ArdDateInputYearTemplateDirective,
  ],
  providers: [
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0000' } },
  ],
})
export class ArdiumDateInputModule {}
