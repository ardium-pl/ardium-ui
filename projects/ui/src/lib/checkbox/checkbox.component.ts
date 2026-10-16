import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Inject,
  input,
  model,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { SimpleComponentColor } from '../types/colors.types';
import { _BooleanComponentBase } from './../_internal/boolean-component';
import { ARD_CHECKBOX_DEFAULTS, ArdCheckboxDefaults } from './checkbox.defaults';
import { ArdCheckboxLabelTemplateDirective, ArdCheckboxTemplateDirective } from './checkbox.directives';
import { _CheckboxTemplateRepositoryDirective } from './checkbox.internal-directives';
import { CheckboxLabelTemplateContext, CheckboxState, CheckboxTemplateContext } from './checkbox.types';

@Component({
  standalone: false,
  selector: 'ard-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumCheckboxComponent
  extends _BooleanComponentBase
  implements ControlValueAccessor, Omit<FormValueControl<boolean>, 'disabled' | 'readonly'>
{
  protected override readonly _DEFAULTS!: ArdCheckboxDefaults;
  constructor(@Inject(ARD_CHECKBOX_DEFAULTS) defaults: ArdCheckboxDefaults) {
    super(defaults);
  }

  protected readonly _componentId = '100';
  protected readonly _componentName = 'checkbox';

  //! label
  // string for defining label text, boolean for showing/hiding label, null for no label
  readonly label = input<string | boolean | null, string | undefined | boolean | null>(null, {
    transform: v => (v === undefined || v === '' ? true : v),
  });

  //! appearance
  readonly color = input<SimpleComponentColor>(this._DEFAULTS.color);
  readonly unselectedColor = input<SimpleComponentColor>(this._DEFAULTS.unselectedColor);

  readonly ngClasses = computed(() =>
    [`ard-color-${this.color()}`, `ard-unselected-color-${this.unselectedColor()}`, `ard-checkbox-${this.internalState()}`].join(
      ' '
    )
  );

  readonly internalState = model<CheckboxState>(CheckboxState.Unselected, { alias: 'state' });

  readonly state = computed<CheckboxState>(() => {
    if (!this.reverseSelected()) return this.internalState();
    if (this.internalState() === CheckboxState.Unselected) return CheckboxState.Selected;
    if (this.internalState() === CheckboxState.Selected) return CheckboxState.Unselected;
    return this.internalState();
  });

  readonly State = CheckboxState;

  //! click action
  toggleState() {
    if (this.disabled() || this.readonly()) return;
    let newState: CheckboxState = CheckboxState.Unselected;
    if (this.internalState() === CheckboxState.Unselected) {
      newState = CheckboxState.Selected;
    }
    this.internalState.set(newState);
    this.value.set(this.internalState() === CheckboxState.Selected);

    this._emitChange();
    this._emitTouched();
  }

  //! templates
  readonly checkboxIconComponent = this._DEFAULTS.CheckboxIconComponent;
  readonly labelComponent = this._DEFAULTS.LabelComponent;

  readonly templateRepository = contentChild(_CheckboxTemplateRepositoryDirective);

  readonly checkboxTemplate = contentChild(ArdCheckboxTemplateDirective);
  readonly labelTemplate = contentChild(ArdCheckboxLabelTemplateDirective);

  readonly checkboxTemplateContext = computed<CheckboxTemplateContext>(() => ({
    $implicit: this.valueAccountingForReverse(),
    selected: this.valueAccountingForReverse(),
    internalSelected: this.value(),
    state: this.state(),
    internalState: this.internalState(),
  }));
  readonly checkboxIconInputs = contextToInputs(this.checkboxTemplateContext, this.checkboxIconComponent);

  readonly labelTemplateContext = computed<CheckboxLabelTemplateContext>(() => {
    const label = this.label();
    return {
      $implicit: typeof label === 'string' ? label : '',
      label: typeof label === 'string' ? label : '',
    };
  });
  readonly labelComponentInputs = contextToInputs(this.labelTemplateContext, this.labelComponent);
}