import { TemplateComponent } from '../types/utility.types';

export const CheckboxState = {
  Unselected: 'unselected',
  Indeterminate: 'indeterminate',
  Selected: 'selected',
} as const;
export type CheckboxState = (typeof CheckboxState)[keyof typeof CheckboxState];

export interface CheckboxTemplateContext {
  $implicit: boolean;
  selected: boolean;
  internalSelected: boolean;
  state: CheckboxState;
  internalState: CheckboxState;
}
export interface CheckboxLabelTemplateContext {
  $implicit: string;
  label: string;
}

export interface ArdCheckboxIcon extends TemplateComponent<CheckboxTemplateContext> {}
export interface ArdCheckboxLabel extends TemplateComponent<CheckboxLabelTemplateContext> {}
