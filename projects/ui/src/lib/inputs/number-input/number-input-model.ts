import { effect, signal, untracked } from '@angular/core';
import { isDefined } from 'simple-bool';
import { ArdTransformer } from '../input-transformers';
import { NumberInputModelHost } from '../input-utils';

export class NumberInputModel2 {
  constructor(protected readonly _ardHostCmp: NumberInputModelHost) {
    effect(() => {
      this._updateInputEl();
    });
  }

  private readonly _inputValue = signal<string>('');
  readonly stringValue = this._inputValue.asReadonly();

  private readonly _numberValue = signal<number | null>(null);
  readonly numberValue = this._numberValue.asReadonly();

  //! writing new value
  private _stringValueToNumber(v: string): number | null {
    return v === '' ? null : Number(v);
  }

  updateValueOnInput(v: string, adjustMinMax: boolean): void {
    v = this._applyStandardConstraints(v, this._inputValue());

    if (adjustMinMax) {
      v = this._applyMinMaxConstraints(v);
    }

    this._inputValue.set(v);
    this._numberValue.set(this._stringValueToNumber(v));
    this._updateInputEl();
  }
  updateValueOnChange(v: number | null, adjustMinMax: boolean): void {
    let stringV = v === null ? '' : String(v);
    stringV = this._applyStandardConstraints(stringV, this._inputValue());

    if (adjustMinMax) {
      stringV = this._applyMinMaxConstraints(stringV);
    }
    const isFocused = untracked(() => this._ardHostCmp.isFocused());
    if (!isFocused) {
      stringV = this._cleanupNumberString(stringV);
    }
    const numberValue = this._stringValueToNumber(stringV);
    if (numberValue === this._numberValue() && isFocused) return;

    this._inputValue.set(stringV);
    this._numberValue.set(this._stringValueToNumber(stringV));
  }
  updateValueWithCleanup(v: string, adjustMinMax: boolean): void {
    const oldV = v;
    v = this._applyStandardConstraints(v, this._inputValue());

    if (adjustMinMax) {
      v = this._applyMinMaxConstraints(v);
    }
    v = this._cleanupNumberString(v);

    this._inputValue.set(v);
    this._numberValue.set(this._stringValueToNumber(v));
  }

  //! constraints
  private _applyStandardConstraints(v: string | number | null, prev: string): string {
    if (!v && v !== 0) return '';

    let strV = String(v);
    strV = this._standardizeSeparator(strV);
    strV = this._applyNumberConstraint(strV, prev);
    strV = this._applyMaxDecimalPlaces(strV);

    return strV;
  }
  private _standardizeSeparator(v: string): string {
    if (!v) return '';
    const sep = this._ardHostCmp.decimalSeparator();
    if (!sep || sep === '.') return v;
    return v.replaceAll(sep, '.');
  }
  private _applyNumberConstraint(v: string, prev: string): string {
    if (!v) return '';

    const min = this._ardHostCmp.min();
    const allowsNegative = min === null || min < 0;
    const transformerFn = this._ardHostCmp.allowFloat()
      ? allowsNegative
        ? ArdTransformer.Float
        : ArdTransformer.PositiveFloat
      : allowsNegative
        ? ArdTransformer.Integer
        : ArdTransformer.PositiveInteger;
    const { text, caretPos } = transformerFn(v, prev, this.caretPos);
    this.caretPos = caretPos;
    return text;
  }
  private _removeDecimalPlaces(v: string): string {
    if (!v) return '';
    return v.split('.')[0];
  }
  private _applyMaxDecimalPlaces(v: string): string {
    if (!v) return '';

    const maxDecimalPlaces = this._ardHostCmp.maxDecimalPlaces();
    if (!isDefined(maxDecimalPlaces) || maxDecimalPlaces === Infinity) return v;
    if (maxDecimalPlaces <= 0) return this._removeDecimalPlaces(v);

    const text = String(v);
    const separatorIndex = text.indexOf('.');
    if (separatorIndex === -1) return text;

    const allowedEnd = separatorIndex + 1 + maxDecimalPlaces;
    if (text.length <= allowedEnd) return text;

    const capped = text.substring(0, allowedEnd);
    if (this.caretPos > capped.length) this.caretPos = capped.length;
    return capped;
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
    const min = this._ardHostCmp.min();
    const max = this._ardHostCmp.max();
    if (max !== null && numericValue > max) return max.toString();
    if (min !== null && numericValue < min) return min.toString();
    return v;
  }
  private _cleanupNumberString(v: string): string {
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
    v = this._fixDecimalPlaces(v);
    return v;
  }
  private _fixDecimalPlaces(v: string): string {
    if (!this._ardHostCmp.allowFloat() || !this._ardHostCmp.fixedDecimalPlaces()) {
      return v;
    }
    const maxDp = this._ardHostCmp.maxDecimalPlaces();
    if (!isDefined(maxDp) || maxDp === Infinity) return v;
    const num = Number(v);
    if (isNaN(num)) return v;
    return num.toFixed(maxDp);
  }

  //! input element
  get caretPos(): number {
    return this._ardHostCmp.inputEl()?.nativeElement.selectionEnd ?? this._inputValue().length;
  }
  set caretPos(pos: number) {
    const el = this._ardHostCmp.inputEl()?.nativeElement;
    el?.setSelectionRange(pos, pos);
  }

  private _updateInputEl(): void {
    let v = this._inputValue();
    const sep = this._ardHostCmp.decimalSeparator();
    if (sep && sep !== '.') {
      v = v.replaceAll('.', sep);
    }
    const el = this._ardHostCmp.inputEl()?.nativeElement;
    if (!el) return;

    const caretPos = this.caretPos;
    el.value = v;
    this.caretPos = caretPos;
  }
}
