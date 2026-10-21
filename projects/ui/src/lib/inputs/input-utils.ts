import { ElementRef, Signal, WritableSignal, computed, effect } from '@angular/core';
import { isAnyString, isDefined, isNull } from 'simple-bool';
import { Nullable } from '../types/utility.types';

export interface InputModelHost {
  readonly componentId: string;
  readonly componentName: string;
  readonly value: WritableSignal<string>;
  readonly maxLength: Signal<Nullable<number>>;
  readonly textInputEl: Signal<ElementRef<HTMLInputElement> | undefined>;
}
export class InputModel {
  constructor(protected readonly _ardHostCmp: InputModelHost) {
    effect(() => {
      this._validateWrittenValue(this._ardHostCmp.value());
    });
    effect(() => {
      this._updateInputElement();
    });
  }

  readonly stringValue = computed<string>(() => {
    let v = this._ardHostCmp.value();
    v = this._applyLengthTransformer(v);
    return v ?? '';
  });

  private _validateWrittenValue(v: any): void {
    if (!isAnyString(v) && !isNull(v)) {
      //warn when using non-string/non-null value
      console.warn(
        new Error(
          `ARD-WA${this._ardHostCmp.componentId}0: Trying to set <ard-${this._ardHostCmp.componentName}>'s value to "${v}" (of type ${typeof v}), expected string or null.`
        )
      );
      //normalize the value
      v = v?.toString?.() ?? String(v);
      this._ardHostCmp.value.set(v);
    }
  }
  clear(): void {
    this._ardHostCmp.value.set('');
  }
  trim(): void {
    this._ardHostCmp.value.update(v => v?.trim() ?? '');
  }

  //! input element
  protected _updateInputElement() {
    const el = this._ardHostCmp.textInputEl()?.nativeElement;
    if (!el) return;
    const caretPos = this.caretPos;
    el.value = this.stringValue();
    this.caretPos = caretPos;
  }
  get caretPos(): number {
    return this._ardHostCmp.textInputEl()?.nativeElement.selectionEnd ?? this.stringValue().length;
  }
  set caretPos(pos: number) {
    this._ardHostCmp.textInputEl()?.nativeElement.setSelectionRange(pos, pos);
  }
  //! constraints
  protected _applyLengthTransformer(v: string): string {
    const max = this._ardHostCmp.maxLength();
    if (!v || !isDefined(max) || v.length <= max) return v;

    const lengthBefore = v.length;
    v = v.substring(0, max);
    const lengthAfter = v.length;
    this.caretPos += lengthAfter - lengthBefore;
    return v;
  }
}
export class AutocompleteInputModel extends InputModel {
  setSelection(from: number | null, to: number | null): void;
  setSelection(from: number | null, to?: number | null): void {
    to = to ?? this._ardHostCmp.value().length ?? Infinity;
    this._ardHostCmp.textInputEl()?.nativeElement.setSelectionRange(from, to);
  }
}

export function escapeAndCreateRegex(str: string, flags?: string, negated = true): RegExp {
  str = str.replace(/([\]]+)/g, '\\$1');
  return new RegExp(`[${negated ? '^' : ''}${str}]`, flags);
}
