import { Directive, TemplateRef } from '@angular/core';
import { FormFieldFrameTemplateContext } from '../form-field-frame';
import { ArdOption, OptionContext } from '../types/item-storage.types';
import {
  CustomOptionContext,
  GroupContext,
  ItemDisplayLimitContext,
  ItemLimitContext,
  PlaceholderContext,
  SearchContext,
  ValueContext,
} from './select.types';

//public (exported)

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-prefix-tmp]' })
export class ArdSelectPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-suffix-tmp]' })
export class ArdSelectSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-value-tmp]' })
export class ArdValueTemplateDirective {
  constructor(public template: TemplateRef<ValueContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-option-tmp]' })
export class ArdOptionTemplateDirective {
  constructor(public template: TemplateRef<OptionContext<ArdOption>>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-optgroup-tmp]' })
export class ArdOptgroupTemplateDirective {
  constructor(public template: TemplateRef<GroupContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-placeholder-tmp]' })
export class ArdSelectPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<PlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-dropdown-arrow-tmp]' })
export class ArdSelectDropdownArrowTemplateDirective {
  constructor(public template: TemplateRef<null>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-loading-spinner-tmp]' })
export class ArdLoadingSpinnerTemplateDirective {
  constructor(public template: TemplateRef<null>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-select > ng-template[ard-loading-placeholder-tmp]',
})
export class ArdLoadingPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<SearchContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-dropdown-header-tmp]' })
export class ArdDropdownHeaderTemplateDirective {
  constructor(public template: TemplateRef<SearchContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-dropdown-footer-tmp]' })
export class ArdDropdownFooterTemplateDirective {
  constructor(public template: TemplateRef<SearchContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-no-items-found-tmp]' })
export class ArdNoItemsFoundTemplateDirective {
  constructor(public template: TemplateRef<SearchContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-add-custom-tmp]' })
export class ArdAddCustomTemplateDirective {
  constructor(public template: TemplateRef<CustomOptionContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-item-limit-reached-tmp]' })
export class ArdItemLimitReachedTemplateDirective {
  constructor(public template: TemplateRef<ItemLimitContext>) {}
}

@Directive({ standalone: false, selector: 'ard-select > ng-template[ard-item-display-limit-tmp]' })
export class ArdItemDisplayLimitTemplateDirective {
  constructor(public template: TemplateRef<ItemDisplayLimitContext>) {}
}
