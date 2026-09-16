import { TemplateComponent } from '../types/utility.types';

export interface ArdModalHeadingTemplateContext {
  $implicit: string;
}

export interface ArdModalCloseIcon extends TemplateComponent<{}> {}
export interface ArdModalHeading extends TemplateComponent<ArdModalHeadingTemplateContext> {}
