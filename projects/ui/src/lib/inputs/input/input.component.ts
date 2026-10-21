import { ChangeDetectionStrategy, Component, contentChild, Inject, ViewEncapsulation } from '@angular/core';
import { contextToInputs } from '../../_internal/utils/context-to-inputs';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { _SimpleInputComponentBase } from '../_simple-input-base';
import { ARD_SIMPLE_INPUT_DEFAULTS, ArdInputDefaults } from './input.defaults';
import {
  ArdInputPlaceholderTemplateDirective,
  ArdInputPrefixTemplateDirective,
  ArdInputSuffixTemplateDirective,
} from './input.directives';

@Component({
  standalone: false,
  selector: 'ard-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumInputComponent,
    },
  ],
})
export class ArdiumInputComponent extends _SimpleInputComponentBase {
  protected override readonly _DEFAULTS!: ArdInputDefaults;
  constructor(@Inject(ARD_SIMPLE_INPUT_DEFAULTS) defaults: ArdInputDefaults) {
    super(defaults);
  }

  readonly componentId = '002';
  readonly componentName = 'input';

  //! prefix & suffix
  readonly prefixTemplate = contentChild(ArdInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  //! placeholder
  readonly placeholderTemplate = contentChild(ArdInputPlaceholderTemplateDirective);

  readonly placeholderComponent = this._DEFAULTS.PlaceholderComponent;

  readonly placeholderComponentInputs = contextToInputs(this.placeholderTemplateContext, this.placeholderComponent);
}
