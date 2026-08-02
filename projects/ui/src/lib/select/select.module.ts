import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumDropdownPanelModule } from '../dropdown-panel/dropdown-panel.module';
import { ArdiumChipModule } from './../chip/chip.module';
import { ArdiumSelectComponent } from './select.component';
import {
  ArdAddCustomTemplateDirective,
  ArdDropdownFooterTemplateDirective,
  ArdDropdownHeaderTemplateDirective,
  ArdItemDisplayLimitTemplateDirective,
  ArdItemLimitReachedTemplateDirective,
  ArdLoadingPlaceholderTemplateDirective,
  ArdLoadingSpinnerTemplateDirective,
  ArdNoItemsFoundTemplateDirective,
  ArdOptgroupTemplateDirective,
  ArdOptionTemplateDirective,
  ArdSelectDropdownArrowTemplateDirective,
  ArdSelectPlaceholderTemplateDirective,
  ArdSelectPrefixTemplateDirective,
  ArdSelectSuffixTemplateDirective,
  ArdValueTemplateDirective,
} from './select.directive';

import { ArdiumClickOutsideModule, ArdiumEscapeHTMLModule } from '@ardium-ui/devkit';
import { ArdiumFormFieldFrameModule } from '../form-field-frame/form-field-frame.module';
import { _ClearButtonModule } from './../_internal/clear-button/clear-button.module';

@NgModule({
  declarations: [
    ArdiumSelectComponent,
    //tempalate directives
    ArdOptionTemplateDirective,
    ArdOptgroupTemplateDirective,
    ArdValueTemplateDirective,
    ArdSelectPlaceholderTemplateDirective,
    ArdLoadingSpinnerTemplateDirective,
    ArdLoadingPlaceholderTemplateDirective,
    ArdDropdownHeaderTemplateDirective,
    ArdDropdownFooterTemplateDirective,
    ArdNoItemsFoundTemplateDirective,
    ArdItemLimitReachedTemplateDirective,
    ArdItemDisplayLimitTemplateDirective,
    ArdAddCustomTemplateDirective,
    ArdSelectPrefixTemplateDirective,
    ArdSelectSuffixTemplateDirective,
    ArdSelectDropdownArrowTemplateDirective,
  ],
  imports: [
  CommonModule,
    ArdiumFormFieldFrameModule,
    ArdiumDropdownPanelModule,
    ArdiumChipModule,
    ArdiumClickOutsideModule,
    _ClearButtonModule,
    ArdiumEscapeHTMLModule,
  ],
  exports: [
    ArdiumSelectComponent,
    //tempalate directives
    ArdOptionTemplateDirective,
    ArdOptgroupTemplateDirective,
    ArdValueTemplateDirective,
    ArdSelectPlaceholderTemplateDirective,
    ArdLoadingSpinnerTemplateDirective,
    ArdLoadingPlaceholderTemplateDirective,
    ArdDropdownHeaderTemplateDirective,
    ArdDropdownFooterTemplateDirective,
    ArdNoItemsFoundTemplateDirective,
    ArdItemLimitReachedTemplateDirective,
    ArdItemDisplayLimitTemplateDirective,
    ArdAddCustomTemplateDirective,
    ArdSelectPrefixTemplateDirective,
    ArdSelectSuffixTemplateDirective,
    ArdSelectDropdownArrowTemplateDirective,
  ],
})
export class ArdiumSelectModule {}
