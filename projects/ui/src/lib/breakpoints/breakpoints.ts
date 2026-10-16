export interface ArdBreakpointsConfig<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  [key: string]: T | undefined;
}

export type ArdBreakpoints = Required<ArdBreakpointsConfig<string>>;

import { InjectionToken, Provider } from '@angular/core';
import { ArdiumBreakpointService } from './breakpoint.service';

const _defaultBreakpoints: ArdBreakpoints = {
  xs: '0rem', // 0px
  sm: '36rem', // 576px
  md: '48rem', // 768px
  lg: '64rem', // 1024px
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
};

export const ARD_BREAKPOINTS = new InjectionToken<Map<string, string>>('ard-breakpoints', {
  factory: () => mapBreakpointsToMediaQueries(_defaultBreakpoints),
});

/**
 * Provides a list of breakpoints for the layout components. Default breakpoints are:
 * - `xs`: 0rem (0px)
 * - `sm`: 36rem (576px)
 * - `md`: 48rem (768px)
 * - `lg`: 64rem (1024px)
 * - `xl`: 80rem (1280px)
 * - `2xl`: 96rem (1536px)
 * @param config The breakpoints configuration object. It will be merged with the default breakpoints.
 */
export function provideBreakpoints(config?: Partial<ArdBreakpoints>): Provider[] {
  return [
    {
      provide: ARD_BREAKPOINTS,
      useValue: mapBreakpointsToMediaQueries({ ..._defaultBreakpoints, ...(config ?? {}) } as ArdBreakpoints),
    },
    ArdiumBreakpointService,
  ];
}

function mapBreakpointsToMediaQueries(breakpoints: ArdBreakpoints): Map<string, string> {
  const map = new Map<string, string>();

  let firstUnit: string | null = null;
  const entries = Object.entries(breakpoints)
    .map(entry => {
      const [key, value] = entry;
      if (value === undefined) {
        return null;
      }
      const [, amountStr, unit] = value.match(/^(\d+(?:\.\d+)?)([a-z]+)$/i) || [];
      const amount = Number(amountStr);
      // validate format
      if (isNaN(amount) || !unit) {
        console.warn(`ARD-WA-G00: Invalid breakpoint format for ${key}: ${value}`);
        return null;
      }
      // validate consistent units
      if (!firstUnit) {
        firstUnit = unit;
      } else if (unit !== firstUnit) {
        console.warn(
          `ARD-WA-G01: All breakpoints must use the same unit. Expected "${firstUnit}" but got "${unit}" for breakpoint "${key}"`
        );
        return null;
      }
      // validate positive values
      if (amount < 0) {
        console.warn(`ARD-WA-G02: Breakpoint values must be non-negative. Invalid value for ${key}: ${value}`);
        return null;
      }

      return [key, { amount, unit }] as [string, { amount: number; unit: string }];
    })
    .filter(entry => entry !== null)
    .sort((a, b) => a![1].amount - b![1].amount) as [string, { amount: number; unit: string }][];

  for (let i = 0; i < entries.length; i++) {
    const [key, { amount, unit }] = entries[i];
    const minWidth = `(min-width: ${amount}${unit})`;

    const nextEntry = entries[i + 1];
    if (!nextEntry) {
      map.set(minWidth, key);
      continue;
    }

    const [, { amount: nextAmount, unit: nextUnit }] = nextEntry;
    const maxWidth = `(max-width: ${nextAmount - 0.01}${nextUnit})`;
    const mediaQuery = i === entries.length - 1 ? minWidth : `${minWidth} and ${maxWidth}`;
    map.set(mediaQuery, key);
  }
  return map;
}
