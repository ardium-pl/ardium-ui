import { computed, effect, ElementRef, Signal, WritableSignal } from '@angular/core';
import { isAnyString, isDefined, isNull } from 'simple-bool';
import { Nullable } from '../../types/utility.types';
import { RegExpTransformer } from '../input-transformers';
import { CaseTransformerType } from '../input-types';

export interface HexInputModelHost {
  readonly value: WritableSignal<string | null>;
  readonly case: Signal<CaseTransformerType>;
  readonly maxDigits: Signal<Nullable<number>>;
  readonly textInputEl: Signal<ElementRef<HTMLInputElement> | undefined>;
}
export class HexInputModel {
  constructor(protected readonly _hostComp: HexInputModelHost) {
    effect(() => {
      this._validateWrittenValue();
    });
    effect(() => {
      this._updateInputElement();
    });
  }

  //! value setters/getters
  readonly stringValue = computed(() => this._hostComp.value() ?? '');

  //! write value handlers
  updateValue(v: string | null): boolean {
    v = v ?? '';

    const oldVal = this._hostComp.value();
    //constraints
    const unconstrainedValue = v;
    if (v) {
      v = this._applyCharactersConstraint(v);
      v = this._applyDigitsConstraint(v, oldVal ?? '');
      v = this._applyCaseTransformer(v);
    }
    this._hostComp.value.set(v || null);

    if (unconstrainedValue !== v && this._hostComp.value() === oldVal) {
      this._updateInputElement();
    }

    return oldVal !== this._hostComp.value();
  }
  private _validateWrittenValue(): void {
    const v = this._hostComp.value() as any;
    if (!isAnyString(v) && !isNull(v)) {
      //warn when using non-string/non-null value
      console.warn(
        new Error(`ARD-WA0160: Trying to set <ard-hex-input>'s value to "${v}" (of type ${typeof v}), expected string or null.`)
      );
      //normalize the value
      this._hostComp.value.set(v?.toString?.() ?? String(v));
    }
  }
  clear(): void {
    this.updateValue(null);
  }

  //! input element methods
  private _updateInputElement() {
    const el = this._hostComp.textInputEl()?.nativeElement;
    if (!el) return;
    const caretPos = this.caretPos;
    el.value = this._hostComp.value() ?? '';
    this.caretPos = caretPos;
  }
  get caretPos(): number {
    return this._hostComp.textInputEl()?.nativeElement.selectionEnd ?? this.stringValue().length;
  }
  set caretPos(pos: number) {
    this._hostComp.textInputEl()?.nativeElement.setSelectionRange(pos, pos);
  }

  //! constraints
  private readonly _charactersRegexTransformer = new RegExpTransformer(/[^0-9a-f]/i, '');
  private _applyCharactersConstraint(v: string): string {
    const { text, caretPos } = this._charactersRegexTransformer.apply(v, '', this.caretPos);
    this.caretPos = caretPos;
    return text;
  }
  private _applyDigitsConstraint(v: string, prev: string): string {
    const maxLength = this._hostComp.maxDigits();
    if (!isDefined(maxLength)) return v;
    if (v.length <= maxLength) return v;
    if (v.length < prev.length) return v;

    let firstChangeIndex = 0;
    while (
      firstChangeIndex < v.length &&
      (!prev.charAt(firstChangeIndex) || v.charAt(firstChangeIndex) === prev.charAt(firstChangeIndex)) &&
      firstChangeIndex <= maxLength
    ) {
      firstChangeIndex++;
    }
    if (firstChangeIndex > maxLength) return v.substring(0, maxLength);

    const overflow = v.length - maxLength;
    this.caretPos -= overflow;
    return v.substring(0, firstChangeIndex) + v.substring(firstChangeIndex + overflow);
  }
  private _applyCaseTransformer(v: string): string {
    if (this._hostComp.case() === CaseTransformerType.Uppercase) return v.toUpperCase();
    if (this._hostComp.case() === CaseTransformerType.Lowercase) return v.toLowerCase();
    return v;
  }
}
