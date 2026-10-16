import { Directive, TemplateRef } from '@angular/core';
import { ArdFormFieldFramePrefixSuffix, FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdSimplestStorageItem, OptionContext } from '../../types/item-storage.types';
import { ArdPlaceholderContext } from '../../types/templates.types';
import { TemplateComponent } from '../../types/utility.types';

@Directive({ standalone: false, selector: 'ard-autocomplete-input > ng-template[ard-suggestion-tmp]' })
export class ArdAutocompleteInputSuggestionTemplateDirective {
  constructor(public template: TemplateRef<OptionContext<ArdSimplestStorageItem>>) {}
}

@Directive({ standalone: false, selector: 'ard-autocomplete-input > ng-template[ard-placeholder-tmp]' })
export class ArdAutocompleteInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<ArdPlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-autocomplete-input > ng-template[ard-loading-tmp]' })
export class ArdAutocompleteInputLoadingTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-autocomplete-input > ng-template[ard-prefix-tmp]' })
export class ArdAutocompleteInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-autocomplete-input > ng-template[ard-suffix-tmp]' })
export class ArdAutocompleteInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

export interface ArdAutocompleteInputSuggestion extends TemplateComponent<OptionContext<ArdSimplestStorageItem>> {}
export interface ArdAutocompleteInputPlaceholder extends TemplateComponent<ArdPlaceholderContext> {}
export interface ArdAutocompleteInputLoading extends TemplateComponent<{}> {}
export interface ArdAutocompleteInputPrefix extends ArdFormFieldFramePrefixSuffix {}
export interface ArdAutocompleteInputSuffix extends ArdFormFieldFramePrefixSuffix {}
