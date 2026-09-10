import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumClickOutsideModule } from '@ardium-pl/devkit';
import { _ClearButtonModule } from '../../_internal/clear-button/clear-button.module';
import { ArdiumDropdownPanelModule } from '../../dropdown-panel/dropdown-panel.module';
import { ArdiumFormFieldFrameModule } from '../../form-field-frame/form-field-frame.module';
import { ArdiumAutocompleteInputComponent } from './autocomplete-input.component';
import { ArdAutocompleteInputLoadingTemplateDirective, ArdAutocompleteInputPlaceholderTemplateDirective, ArdAutocompleteInputPrefixTemplateDirective, ArdAutocompleteInputSuffixTemplateDirective, ArdAutocompleteInputSuggestionTemplateDirective } from './autocomplete-input.directives';

@NgModule({
  declarations: [
    ArdiumAutocompleteInputComponent,
    ArdAutocompleteInputSuggestionTemplateDirective,
    ArdAutocompleteInputPlaceholderTemplateDirective,
    ArdAutocompleteInputLoadingTemplateDirective,
    ArdAutocompleteInputPrefixTemplateDirective,
    ArdAutocompleteInputSuffixTemplateDirective,
  ],
  imports: [
    CommonModule,
    ArdiumFormFieldFrameModule,
    _ClearButtonModule,
    ArdiumDropdownPanelModule,
    ArdiumClickOutsideModule,
  ],
  exports: [
    ArdiumAutocompleteInputComponent,
    ArdAutocompleteInputSuggestionTemplateDirective,
    ArdAutocompleteInputPlaceholderTemplateDirective,
    ArdAutocompleteInputLoadingTemplateDirective,
    ArdAutocompleteInputPrefixTemplateDirective,
    ArdAutocompleteInputSuffixTemplateDirective,
  ],
})
export class ArdiumAutocompleteInputModule {}
