import { ElementRef, Signal } from '@angular/core';
import { DigitInputTransform } from './digit-input.types';

export interface DigitInputConfigData {
  type: DigitInputConfigDataType;
  char?: string;
  index?: number;
  readonly?: boolean;
  placeholder?: string;
}
export interface DigitInputModelHost {
  readonly inputs: Signal<readonly ElementRef<HTMLInputElement>[]>;
  readonly transform: Signal<DigitInputTransform>;
}

export const DigitInputConfigDataType = {
  Input: 'input',
  Static: 'static',
} as const;
export type DigitInputConfigDataType = (typeof DigitInputConfigDataType)[keyof typeof DigitInputConfigDataType];

export function _sanitizeRegExpString(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
