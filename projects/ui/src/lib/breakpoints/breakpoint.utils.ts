import { coerceArrayProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import { isNull, isNumber, isObject } from 'simple-bool';
import { ArdGridSize, isArdGridSize } from '../grid';
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
  value: T | string | ArdBreakpointsConfig<T> | undefined,
  breakpoints: string[],
  componentId: string,
  isEnumValue: (val: any) => val is T
): Required<ArdBreakpointsConfig<T>> {
  if (isEnumValue(value)) {
    // If it's an enum value, apply it to all breakpoints
    return fillInMissingBreakpoints({ xs: value as T }, breakpoints, componentId);
  }
  if (value === undefined) {
    return fillInMissingBreakpoints({ xs: undefined as unknown as T }, breakpoints, componentId);
  }
  return transformResponsiveValue<T>(value, breakpoints, componentId, v => (isEnumValue(v) ? v : undefined));
}

/**
 * Normalizes various responsive value representations into a full {@link ArdBreakpointsConfig}.
 *
 * - `number`: same value is applied to all breakpoints.
 * - `string`: either a single number or a space-separated breakpoint list
 *   like `"xs:1 sm:2 md:3 lg:4 xl:5"`.
 * - `ArdBreakpointsConfig`: missing breakpoints are filled based on smaller ones.
 */
export function transformResponsiveValue<T>(
  v: T | string | ArdBreakpointsConfig<T>,
  breakpoints: string[],
  componentId: string,
  parseValue: (val: string) => T | undefined
): Required<ArdBreakpointsConfig<T>>;

/**
 * Normalizes various responsive value representations into a full {@link ArdBreakpointsConfig}.
 *
 * - `number`: same value is applied to all breakpoints.
 * - `string`: either a single number or a space-separated breakpoint list
 *   like `"xs:1 sm:2 md:3 lg:4 xl:5"`.
 * - `ArdBreakpointsConfig`: missing breakpoints are filled based on smaller ones.
 */
export function transformResponsiveValue<T, R extends T>(
  v: T | string | ArdBreakpointsConfig<T>,
  breakpoints: string[],
  componentId: string,
  parseValue: (val: string) => R | undefined,
  parseToR: (val: T) => R
): Required<ArdBreakpointsConfig<R>>;

export function transformResponsiveValue<T, R extends T>(
  v: T | string | ArdBreakpointsConfig<T>,
  breakpoints: string[],
  componentId: string,
  parseValue: (val: string) => R | undefined,
  parseToR?: (val: T) => R
): Required<ArdBreakpointsConfig<R>> {
  // if it's an object, fill in missing breakpoints
  if (isObject(v)) {
    const vAsR = {} as Partial<ArdBreakpointsConfig<R>>;
    for (const [bp, val] of Object.entries(v)) {
      vAsR[bp] = parseToR?.(val!) ?? (val as unknown as R);
    }

    return fillInMissingBreakpoints<R>(vAsR, breakpoints, componentId);
  }
  // parse string like "xs:1 sm:2 md:3 lg:4 xl:5"
  const items = coerceArrayProperty(v, ' ')
    .map(item => {
      const [breakpointOrValue, value] = item.split(':');
      const rawValue = value !== undefined ? value.trim() : breakpointOrValue.trim();
      return {
        breakpoint: value !== undefined ? breakpointOrValue.trim() : 'xs',
        rawValue,
        value: parseValue(rawValue),
      };
    })
    .filter(item => {
      if (!breakpoints.includes(item.breakpoint)) {
        console.warn(`ARD-WA${componentId}0: Unknown breakpoint "${item.breakpoint}:${item.value}". This entry will be ignored.`);
        return false;
      }
      if (item.value === undefined || item.value === null || item.value === '' || (isNumber(item.value) && isNaN(item.value))) {
        console.warn(`ARD-WA${componentId}1: Invalid value for breakpoint "${item.breakpoint}". This entry will be ignored.`);
        return false;
      }
      return true;
    })
    .reduce(
      (acc, curr) => {
        if (acc[curr.breakpoint]) {
          console.warn(
            `ARD-WA${componentId}2: Duplicate value for breakpoint "${curr.breakpoint}". The value "${curr.rawValue}" will overwrite the previous value "${acc[curr.breakpoint]}".`
          );
        }
        acc[curr.breakpoint] = curr.value;
        return acc;
      },
      {} as Record<string, R | undefined>
    );
  return fillInMissingBreakpoints(items, breakpoints, componentId);
}

export function fillInMissingBreakpoints<T>(
  config: Partial<ArdBreakpointsConfig<T>>,
  breakpoints: string[],
  componentId: string
): Required<ArdBreakpointsConfig<T>> {
  const filledConfig: Record<string, T> = {};
  let lastValue: T | undefined = undefined;
  for (const bp of breakpoints) {
    if (config[bp] !== undefined) {
      filledConfig[bp] = config[bp]!;
      lastValue = config[bp];
      continue;
    }
    if (lastValue !== undefined) {
      filledConfig[bp] = lastValue;
      continue;
    }
    throw new Error(`ARD-FT${componentId}3: Missing value for breakpoint "${bp}" and no smaller breakpoint to inherit from.`);
  }
  return filledConfig as Required<ArdBreakpointsConfig<T>>;
}
