import { coerceNumberProperty } from '@ardium-pl/devkit';
import { isNull, isNumber } from 'simple-bool';
import { ArdGridSize, isArdGridSize } from '../grid';
import { fillInMissingBreakpoints, transformResponsiveValue } from '../grid/grid.utils';
import { ArdBreakpointsConfig } from './breakpoints';

export function parseNumberOrBreakpointConfig(
  value: number | string | ArdBreakpointsConfig<number>,
  breakpoints: string[],
  componentId: string
): Required<ArdBreakpointsConfig<number>> {
  if (typeof value === 'number') {
    // If it's a number, apply it to all breakpoints
    return fillInMissingBreakpoints({ xs: value }, breakpoints, componentId);
  }
  return transformResponsiveValue<number>(value, breakpoints, componentId, coerceNumberProperty);
}

export function parseSizeOrBreakpointConfig(
  value: number | ArdGridSize | string | ArdBreakpointsConfig<number | ArdGridSize>,
  breakpoints: string[],
  componentId: string
): Required<ArdBreakpointsConfig<number | ArdGridSize>> {
  if (typeof value === 'number' || isArdGridSize(value)) {
    // If it's a number or ArdGridSize, apply it to all breakpoints
    return fillInMissingBreakpoints({ xs: value }, breakpoints, componentId);
  }
  return transformResponsiveValue<number | ArdGridSize>(value, breakpoints, componentId, v => {
    if (isArdGridSize(v)) {
      return v;
    }
    return coerceNumberProperty(v);
  });
}

export function parseBooleanOrBreakpointConfig(
  value: boolean | string | ArdBreakpointsConfig<boolean>,
  breakpoints: string[],
  componentId: string
): Required<ArdBreakpointsConfig<boolean>> {
  if (typeof value === 'boolean') {
    // If it's a boolean, apply it to all breakpoints
    return fillInMissingBreakpoints({ xs: value }, breakpoints, componentId);
  }
  if (value === '' || value === 'true') {
    return fillInMissingBreakpoints({ xs: true }, breakpoints, componentId);
  }
  return transformResponsiveValue<boolean>(value, breakpoints, componentId, v => v === 'true');
}

export function parseCSSUnitOrBreakpointConfig(
  value: null | number | string | ArdBreakpointsConfig<string | number>,
  breakpoints: string[],
  componentId: string
): Required<ArdBreakpointsConfig<string>> | null {
  if (isNull(value)) {
    return value;
  }
  if (isNumber(value)) {
    fillInMissingBreakpoints({ xs: value }, breakpoints, componentId);
  }
  return transformResponsiveValue<string | number, string>(
    value,
    breakpoints,
    componentId,
    v => {
      const num = coerceNumberProperty(v, NaN);
      return isNaN(num) ? v : `calc(var(--ard-grid-spacing-unit) * ${num})`;
    },
    v => (typeof v === 'number' ? `calc(var(--ard-grid-spacing-unit) * ${v})` : v)
  );
}

export function parseEnumOrBreakpointConfig<T>(
  value: T | string | ArdBreakpointsConfig<T>,
  breakpoints: string[],
  componentId: string,
  isEnumValue: (val: any) => val is T
): Required<ArdBreakpointsConfig<T>> {
  if (isEnumValue(value)) {
    // If it's an enum value, apply it to all breakpoints
    return fillInMissingBreakpoints({ xs: value as T }, breakpoints, componentId);
  }
  return transformResponsiveValue<T>(value, breakpoints, componentId, v => (isEnumValue(v) ? v : undefined));
}
