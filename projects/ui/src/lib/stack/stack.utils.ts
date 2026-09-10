import { coerceArrayProperty } from '@ardium-pl/devkit';
import { isNumber, isObject } from 'simple-bool';
import { ArdBreakpointsConfig } from './../breakpoints/breakpoints';

/**
 * Normalizes various responsive value representations into a full {@link ArdBreakpointsConfig}.
 *
 * - `number`: same value is applied to all breakpoints.
 * - `string`: either a single number or a space-separated breakpoint list
 *   like `"xs:1 sm:2 md:3 lg:4 xl:5"`.
 * - `ArdBreakpointsConfig`: missing breakpoints are filled based on smaller ones.
 */
export function transformResponsiveValue<T, R extends T = T>(
  v: T | string | ArdBreakpointsConfig<T>,
  breakpoints: string[],
  parseValue: (val: string) => R | undefined
): Required<ArdBreakpointsConfig<R>> {
  // if it's an object, fill in missing breakpoints
  if (isObject(v)) {
    return fillInMissingBreakpoints<R>(v as ArdBreakpointsConfig<R>, breakpoints);
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
        console.warn(`ARD-WA6010: Unknown breakpoint "${item.breakpoint}:${item.value}". This entry will be ignored.`);
        return false;
      }
      if (item.value === undefined || item.value === null || item.value === '' || (isNumber(item.value) && isNaN(item.value))) {
        console.warn(`ARD-WA6011: Invalid value for breakpoint "${item.breakpoint}". This entry will be ignored.`);
        return false;
      }
      return true;
    })
    .reduce(
      (acc, curr) => {
        if (acc[curr.breakpoint]) {
          console.warn(
            `ARD-WA6012: Duplicate value for breakpoint "${curr.breakpoint}". The value "${curr.rawValue}" will overwrite the previous value "${acc[curr.breakpoint]}".`
          );
        }
        acc[curr.breakpoint] = curr.value;
        return acc;
      },
      {} as Record<string, R | undefined>
    );
  return fillInMissingBreakpoints(items, breakpoints);
}

export function fillInMissingBreakpoints<T>(
  config: Partial<ArdBreakpointsConfig<T>>,
  breakpoints: string[]
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
    throw new Error(`ARD-FT6013: Missing value for breakpoint "${bp}" and no smaller breakpoint to inherit from.`);
  }
  return filledConfig as Required<ArdBreakpointsConfig<T>>;
}
