import { computed, reflectComponentType, Signal, Type } from '@angular/core';

export function contextToInputs<T>(context: Signal<Record<string, any>>, component: Type<T> | undefined): Signal<Partial<T>> {
  let allowed: Set<string> | undefined;
  return computed(() => {
    if (!component) return {};

    if (!allowed) {
      const meta = reflectComponentType(component);
      if (!meta) return {};

      allowed = new Set(meta.inputs.map(i => i.templateName));
    }
    return Object.fromEntries(Object.entries(context()).filter(([key]) => allowed!.has(key))) as Partial<T>;
  });
}

export function contextToInputsMultiple<T, V>(
  context: Signal<(value: V) => Record<string, any>>,
  component: Type<T> | undefined
): Signal<(value: V) => Partial<T>> {
  let allowed: Set<string> | undefined;
  return computed(() => {
    if (!component) return () => ({});

    if (!allowed) {
      const meta = reflectComponentType(component);
      if (!meta) return () => ({});

      allowed = new Set(meta.inputs.map(i => i.templateName));
    }
    return (value: V) => Object.fromEntries(Object.entries(context()(value)).filter(([key]) => allowed!.has(key))) as Partial<T>;
  });
}
