import { computed, reflectComponentType, Signal, Type } from '@angular/core';

type Context = Record<string, any>;
type ContextFactory<V> = (value: V) => Context;

export function contextToInputs<T, V>(
  context: Signal<ContextFactory<V>>,
  component: Type<T> | undefined
): Signal<(value: V) => Partial<T>>;

export function contextToInputs<T>(
  context: Signal<Context>,
  component: Type<T> | undefined
): Signal<Partial<T>>;

export function contextToInputs<T, V>(
  context: Signal<Context | ContextFactory<V>>,
  component: Type<T> | undefined
): Signal<Partial<T> | ((value: V) => Partial<T>)> {
  const meta = component ? reflectComponentType(component) : null;
  const allowed = new Set(meta?.inputs.map(i => i.templateName) ?? []);

  const filter = (value: Context): Partial<T> =>
    Object.fromEntries(
      Object.entries(value).filter(([key]) => allowed.has(key))
    ) as Partial<T>;

  return computed(() => {
    const value = context();

    if (typeof value === 'function') {
      return (arg: V) => filter(value(arg));
    }

    return filter(value);
  });
}