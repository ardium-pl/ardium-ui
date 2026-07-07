import { ElementRef, Signal, computed, signal } from '@angular/core';
import { isAnyString, isDefined, isNull, isNumber } from 'simple-bool';
import { Nullable } from '../types/utility.types';
import { ArdTransformer, RegExpTransformer } from './input-transformers';
import { ArdNumberInputMinMaxBehavior } from './number-input/number-input.types';

export interface InputModelHost {
  readonly maxLength: Signal<Nullable<number>>;
  readonly textInputEl: Signal<ElementRef<HTMLInputElement> | undefined>;
}
export class InputModel {
  constructor(protected readonly _ardHostCmp: InputModelHost) {}

  readonly value = signal<string | null>(null);
  readonly stringValue = computed<string>(() => this.value() ?? '');

  writeValue(v: any): boolean {
    if (!isAnyString(v) && !isNull(v)) {
      //warn when using non-string/non-null value
      console.warn(
        new Error(`ARD-WA0020: Trying to set <ard-input>'s value to "${v}" (of type ${typeof v}), expected string or null.`)
      );
      //normalize the value
      v = v?.toString?.() ?? String(v);
    }
    return this._writeValue(v);
  }
  protected _writeValue(v: string | null): boolean {
    //constraints
    v = this._applyLengthTransformer(v);
    //update view
    const oldVal = this.value();
    this.value.set(v);
    this._updateInputElement();
    return oldVal !== v;
  }
  rewriteValueAfterHostUpdate(): void {
    this._writeValue(this.value());
  }
  clear(): void {
    this.value.set(null);
    this._updateInputElement();
  }
  trim(): void {
    this.value.update(v => v?.trim() ?? null);
    this._updateInputElement();
  }

  _updateInputElement() {
    const el = this._ardHostCmp.textInputEl()?.nativeElement;
    if (!el) return;
    el.value = this.stringValue();
  }
  get caretPos(): number {
    return this._ardHostCmp.textInputEl()?.nativeElement.selectionEnd ?? this.stringValue.length;
  }
  set caretPos(pos: number) {
    this._ardHostCmp.textInputEl()?.nativeElement.setSelectionRange(pos, pos);
  }
  //! constraints
  protected _applyLengthTransformer(v: string | null): string | null {
    const max = this._ardHostCmp.maxLength();
    if (!isDefined(max)) return v;
    if (!v || v.length <= max) return v;

    v = v.substring(0, max);
    this.caretPos = max;
    return v;
  }
}
export interface AutocompleteInputModelHost extends InputModelHost {
  charlist: Signal<RegExp | undefined>;
}
export class AutocompleteInputModel extends InputModel {
  constructor(protected override readonly _ardHostCmp: AutocompleteInputModelHost) {
    super(_ardHostCmp);
  }
  protected override _writeValue(v: string | null): boolean {
    //transformers
    if (v) {
      let prev = this.stringValue();
      v = this._applyAllowOrDenylistTransformer(v, prev);
      prev = this.stringValue();
      v = this._applyLengthTransformer(v);
    }
    const oldVal = this.value();
    //update view
    this.value.set(v);
    this._updateInputElement();
    return oldVal !== v;
  }

  setSelection(from: number | null, to: number | null): void;
  setSelection(from: number | null, to?: number | null): void {
    to = to ?? this.value()?.length ?? Infinity;
    this._ardHostCmp.textInputEl()?.nativeElement.setSelectionRange(from, to);
  }
  //* constraints
  protected _applyAllowOrDenylistTransformer(v: string, prev: string): string {
    const charlist = this._ardHostCmp.charlist();
    if (!charlist || !v) return v;
    const { text, caretPos } = new RegExpTransformer(charlist).apply(v, prev, this.caretPos);
    this.caretPos = caretPos;
    return text;
  }
}

export interface NumberInputModelHost {
  readonly max: Signal<number>;
  readonly min: Signal<number>;
  readonly minMaxBehavior: Signal<ArdNumberInputMinMaxBehavior>;
  readonly maxDecimalPlaces: Signal<number>;
  readonly fixedDecimalPlaces: Signal<boolean>;
  readonly decimalSeparator: Signal<string>;
  readonly allowFloat: Signal<boolean>;
  readonly inputEl: Signal<ElementRef<HTMLInputElement> | undefined>;
}
export class NumberInputModel {
  constructor(protected readonly _ardHostCmp: NumberInputModelHost) {}

  //! value setters/getters
  protected readonly _value = signal<string | null>(null);
  readonly value = this._value.asReadonly();
  readonly stringValue = computed(() => this._value() ?? '');
  readonly numberValue = computed(() => (this._value() === null ? null : Number(this._value())));

  setValue(v: string | number | null): void {
    let stringV = isNumber(v) ? String(v) : v;

    if (stringV) {
      const sep = this._ardHostCmp.decimalSeparator();
      if (sep) {
        // always store with dot as decimal separator for internal consistency
        if (sep !== '.') {
          stringV = stringV.split(sep).join('.');
        }
      }
    }
    this._value.set(stringV);
    this._updateInputEl();
  }
  updateOnBlur(adjustMinMax?: boolean): void {
    let v = this._value();
    if (isNull(v)) return;

    v = this._applyStandardConstraints(
      v,
      adjustMinMax ?? this._ardHostCmp.minMaxBehavior() === ArdNumberInputMinMaxBehavior.AdjustOnBlur
    );
    // remove trailing zeros after decimal point
    if (v.includes('.')) {
      v = v.replace(/(\.\d*?)0+$/, '$1');
    }
    // remove decimal point if no digits after it
    if (v.endsWith('.')) {
      v = v.slice(0, -1);
    }
    // remove leading zeros (but keep "0" if the value is zero)
    if (!v.match(/^0(\.\d+)?$/)) {
      v = v.replace(/^0+/, '');
    }
    // apply fixed decimal places if configured
    if (this._ardHostCmp.allowFloat() && this._ardHostCmp.fixedDecimalPlaces()) {
      v = this._fixDecimalPlaces(v);
    }

    this.setValue(v);
  }
  private _fixDecimalPlaces(v: string): string {
    const maxDp = this._ardHostCmp.maxDecimalPlaces();
    if (!isDefined(maxDp) || maxDp === Infinity) return v;
    const num = Number(v);
    if (isNaN(num)) return v;
    return num.toFixed(maxDp);
  }

  private _updateInputEl(): void {
    let stringV = this.stringValue();
    const sep = this._ardHostCmp.decimalSeparator();
    if (sep && sep !== '.') {
      stringV = stringV.split('.').join(sep);
    }
    const el = this._ardHostCmp.inputEl()?.nativeElement;
    if (!el) return;

    const caretPos = this.caretPos;
    el.value = stringV;
    this.caretPos = caretPos;
  }

  //! write value handlers
  writeValue(v: any, applyConstraints: boolean): boolean {
    if (!isNumber(v) && !isAnyString(v) && !isNull(v)) {
      //warn when using non-string/non-null value
      console.warn(
        new Error(`ARD-WA0070: Trying to set <ard-number-input>'s value to "${typeof v}", expected string, number, or null.`)
      );
      //normalize the value
      v = v?.toString?.() ?? String(v);
    }
    // check if value is already the same as current value
    if (v === null ? v === this._value() : Number(v) === this.numberValue()) return false;

    v = v === null ? null : String(v);
    return this._writeValue(v, applyConstraints);
  }
  protected _writeValue(v: string | null, applyConstraints: boolean): boolean {
    //constraints
    if (applyConstraints) {
      v = this._applyStandardConstraints(v, this._ardHostCmp.minMaxBehavior() === ArdNumberInputMinMaxBehavior.AdjustOnInput);
    }

    if (v === '') v = null;
    //update view
    const oldVal = this._value();
    this.setValue(v);
    return oldVal !== v;
  }
  rewriteValueAfterHostUpdate(): void {
    this._writeValue(this._value(), false);
  }

  //! input element methods
  get caretPos(): number {
    return this._ardHostCmp.inputEl()?.nativeElement.selectionEnd ?? this.stringValue().length;
  }
  set caretPos(pos: number) {
    const el = this._ardHostCmp.inputEl()?.nativeElement;
    el?.setSelectionRange(pos, pos);
  }

  //! constraints
  private _applyStandardConstraints(v: string | number | null, adjustMinMax: boolean): string {
    if (!v && v !== 0) return '';

    v = this._standardizeSeparator(v);
    v = this._removeDecimalPlaces(v);
    v = this._applyNumberConstraint(v);
    v = this._applyMaxDecimalPlaces(v);

    if (adjustMinMax) {
      v = this._applyMinMaxConstraints(v);
    }
    return v;
  }

  private _standardizeSeparator(v: string | number | null): string {
    if (!v && v !== 0) return '';
    const sep = this._ardHostCmp.decimalSeparator();
    if (!sep || sep === '.') return String(v);
    return String(v).replaceAll(sep, '.');
  }
  private _removeDecimalPlaces(v: string | number | null): string | number {
    if (!v && v !== 0) return '';
    if (this._ardHostCmp.allowFloat()) return v;

    return String(v).split('.')[0];
  }
  private _applyNumberConstraint(v: string | number): string {
    if (!v && v !== 0) return '';

    const input = String(v);
    const prev = this.stringValue();

    const transformerFn = this._ardHostCmp.allowFloat() ? ArdTransformer.Float : ArdTransformer.Integer;
    const { text, caretPos } = transformerFn(input, prev, this.caretPos);
    this.caretPos = caretPos;

    // return normalized text (dot separator) – display logic handles conversion
    return text;
  }
  private _applyMinMaxConstraints(v: string): string {
    if (!v) return '';

    // convert separator to dot for numeric comparison
    const sep = this._ardHostCmp.decimalSeparator();
    let numericString = v;
    if (sep && sep !== '.') {
      numericString = numericString.replaceAll(sep, '.');
    }
    const numericValue = Number(numericString);
    if (numericValue > this._ardHostCmp.max()) return this._ardHostCmp.max().toString();
    if (numericValue < this._ardHostCmp.min()) return this._ardHostCmp.min().toString();
    return v;
  }

  private _applyMaxDecimalPlaces(v: string | number): string {
    if (!v && v !== 0) return '';

    const maxDecimalPlaces = this._ardHostCmp.maxDecimalPlaces();
    if (!isDefined(maxDecimalPlaces) || maxDecimalPlaces === Infinity) return String(v);
    if (maxDecimalPlaces <= 0) return this._removeDecimalPlaces(v).toString();

    const text = String(v);
    const separatorIndex = text.indexOf('.');
    if (separatorIndex === -1) return text;

    const allowedEnd = separatorIndex + 1 + maxDecimalPlaces;
    if (text.length <= allowedEnd) return text;

    const capped = text.substring(0, allowedEnd);
    if (this.caretPos > capped.length) this.caretPos = capped.length;
    return capped;
  }
}

export function escapeAndCreateRegex(str: string, flags?: string, negated = true): RegExp {
  str = str.replace(/([\]]+)/g, '\\$1');
  return new RegExp(`[${negated ? '^' : ''}${str}]`, flags);
}
