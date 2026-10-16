import { TemplateComponent } from '../types/utility.types';

export interface FormFieldFrameTemplateContext {
  hasError: boolean;
  disabled: boolean;
  readonly: boolean;
  isSuccess: boolean;
  isFocused: boolean;
}

export interface ArdFormFieldFramePrefixSuffix extends TemplateComponent<FormFieldFrameTemplateContext> {}
export interface ArdFormFieldFramePrefix extends ArdFormFieldFramePrefixSuffix {}
export interface ArdFormFieldFrameSuffix extends ArdFormFieldFramePrefixSuffix {}
