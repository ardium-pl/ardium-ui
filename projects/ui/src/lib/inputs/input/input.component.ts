import { ChangeDetectionStrategy, Component, contentChild, forwardRef, Inject, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumInputComponent),
      multi: true,
    },
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

  //! prefix & suffix
  readonly prefixTemplate = contentChild(ArdInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  //! placeholder
  readonly placeholderTemplate = contentChild(ArdInputPlaceholderTemplateDirective);
}
