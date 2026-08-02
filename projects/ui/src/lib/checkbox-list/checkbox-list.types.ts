import { ArdOptionSimple, OptionContext } from '../types/item-storage.types';
import { TemplateComponent } from '../types/utility.types';

export interface ArdCheckboxListLabelComponent extends TemplateComponent<OptionContext<ArdOptionSimple>> {}

export const CheckboxListAlignType = {
  LeftClumped: 'left-clumped',
  LeftSplit: 'left-split',
  RightSplit: 'right-split',
  RightClumped: 'right-clumped',
} as const;
export type CheckboxListAlignType = (typeof CheckboxListAlignType)[keyof typeof CheckboxListAlignType];
