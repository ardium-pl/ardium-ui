import { ArdFormFieldFramePrefix } from "../../form-field-frame";
import { TemplateComponent } from "../../types/utility.types";

export type ArdDateInputSerializeFn<T> = (date: T | null) => string;
export type ArdDateInputDeserializeFn<T> = (date: string, prevValue: T | null) => T | null;

export interface ArdDateInputValueContext<T> {
  $implicit: string;
  rawValue: T | null;
}

export interface ArdDateInputAcceptButtonsContext {
  $implicit: () => void;
  cancel: () => void;
  accept: () => void;
  disabled: boolean;
}

export const ArdDateInputMinMaxStrategy = {
  Allow: 'allow',
  Adjust: 'adjust',
} as const;
export type ArdDateInputMinMaxStrategy = (typeof ArdDateInputMinMaxStrategy)[keyof typeof ArdDateInputMinMaxStrategy];

export interface ArdDateInputValue extends TemplateComponent<ArdDateInputValueContext<Date>> {}
export interface ArdDateInputCalendarIcon extends TemplateComponent<{}> {}
export interface ArdDateInputAcceptButtons extends TemplateComponent<ArdDateInputAcceptButtonsContext> {}
export interface ArdDateInputPrefix extends ArdFormFieldFramePrefix {}
export interface ArdDateInputSuffix extends ArdFormFieldFramePrefix {}
