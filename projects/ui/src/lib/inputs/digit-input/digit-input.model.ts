import { computed, effect, signal } from '@angular/core';
import { coerceArrayProperty } from '@ardium-pl/devkit';
import { isAnyString, isFunction, isNull, isNumber, isRegExp } from 'simple-bool';
import {
  DigitInputAcceptObject,
  DigitInputConfig,
  DigitInputOption,
  DigitInputPrimitiveOption,
  TransformType,
} from './digit-input.types';
import { DigitInputConfigData, DigitInputConfigDataType, DigitInputModelHost, _sanitizeRegExpString } from './digit-input.utils';

export class DigitInputModel {
  constructor(private _ardHost: DigitInputModelHost) {
    //set the value array to be the same length
    effect(() => {
      const configArr = this.configArrayData();

      this._internalValue.update(arr => {
        if (!arr) arr = [];
        const newArr: (string | null)[] = [];
        for (let i = 0; i < configArr.length; i++) {
          const curr = arr[i];
          const config = configArr[i];
          newArr.push(config.type === DigitInputConfigDataType.Static ? null : (curr ?? null));
        }
        return newArr;
      });
    });
    // validate
    effect(() => {
      this._validateWrittenValue();
    });
    // update inputs
    effect(() => {
      this._updateInputElements();
    });
  }

  private readonly _configArray = signal<DigitInputOption[]>([]);

  readonly configArrayData = computed<DigitInputConfigData[]>(() => {
    return this._configArray().map((v, i) => {
      if ('static' in v) {
        return {
          type: DigitInputConfigDataType.Static,
          char: v.static,
        } satisfies DigitInputConfigData;
      }
      return {
        type: DigitInputConfigDataType.Input,
        index: i,
        readonly: v.readonly,
        placeholder: v.placeholder ?? '',
      } satisfies DigitInputConfigData;
    });
  });

  readonly isConfigDefined = computed((): boolean => this._configArray().length > 0);

  private readonly _internalValue = signal<(string | null)[] | null>(null);

  private readonly _valueWithStatics = computed<(string | null)[]>(() => {
    const configArr = this.configArrayData();
    const arr = this._internalValue() ?? [];

    const newArr: (string | null)[] = [];
    for (let i = 0; i < configArr.length; i++) {
      const curr = arr[i];
      const config = configArr[i];
      newArr.push(config.type === DigitInputConfigDataType.Static ? config.char! : (curr ?? null));
    }
    return newArr;
  });

  readonly stringValue = computed(
    (): string =>
      this._valueWithStatics()
        ?.map(v => v ?? ' ')
        .join('') ?? ''
  );

  private _validateWrittenValue() {
    const v = this.stringValue();

    if (!isAnyString(v) && !isNull(v)) {
      throw new Error(
        `ARD-FT0040b: Trying to set <ard-digit-input>'s value to "${v}" (of type ${typeof v}), expected string or null.`
      );
    }
    const vStr = v ?? '';

    if (vStr.length > this._configArray().length) {
      console.warn(
        `ARD-WA0041: Value provided to <ard-digit-input> is too long. Got ${
          vStr.length
        } characters, but expected a maximum of ${this._configArray().length} characters.`
      );
    }
  }

  readonly isValueFull = computed((): boolean => this._valueWithStatics()?.filter(v => v).length === this._configArray().length);
  readonly isValueEmpty = computed((): boolean => this._internalValue()?.filter(v => v).length === 0);

  isDefinedAtIndex(index: number): boolean {
    return !!this._internalValue()?.[index];
  }

  private _updateInputElements() {
    const v = this._internalValue() ?? [];
    let i = 0;
    for (const inputEl of this._ardHost.inputs()) {
      inputEl.nativeElement.value = v[i] ?? '';
      i++;
    }
  }

  //! setting config
  setConfig(config: DigitInputConfig): void {
    this._setConfig(config);
    this.validateValueAndUpdate();
  }
  private _setConfig(config: DigitInputConfig): void {
    //map a number to ready objects
    let configAsNumber = isAnyString(config) ? Number(config) : null;
    if (isNumber(config) || isNumber(configAsNumber)) {
      configAsNumber = isNumber(config) ? config : configAsNumber!;
      this._configArray.set(new Array(configAsNumber).fill({ accept: (str: string) => /[0-9]/.test(str) }));
      return;
    }
    //map a string to an array
    let configArr: string[] | Exclude<DigitInputConfig, number | string>;
    if (isAnyString(config)) {
      configArr = coerceArrayProperty(config);
    } else {
      configArr = config;
    }
    //map array to ready objects
    this._configArray.set(
      configArr.map((v, i) => {
        if (!isAnyString(v)) {
          if ('accept' in v && !isFunction(v.accept)) {
            const regExp = isRegExp(v.accept) ? v.accept : new RegExp(`[${_sanitizeRegExpString(v.accept)}]`);
            v.accept = str => regExp.test(str);
          }
          return v;
        }

        switch (v) {
          case DigitInputPrimitiveOption.Number:
            return { accept: str => /[0-9]/.test(str) };
          case DigitInputPrimitiveOption.Letter:
            return { accept: str => /[a-zA-Z]/.test(str) };
          case DigitInputPrimitiveOption.Alphanumeric:
            return { accept: str => /[0-9a-zA-Z]/.test(str) };
          case DigitInputPrimitiveOption.Special:
            return { accept: str => /[!@#$%^&*-_=+/\\.,]/.test(str) };

          default:
            if (configArr.length === 1) {
              throw new Error(`ARD-NF0043S: <ard-digit-input>'s config is invalid. Expected number or array, got "${v}"`);
            }
            throw new Error(`ARD-NF0043B: Found invalid string "${v}" in <ard-digit-input>'s config at index ${i}`);
        }
      })
    );
  }

  resetInputValue(index: number): void {
    if (index < 0 || index > this._configArray().length) return;

    const config = this._configArray()[index] as DigitInputOption;
    let newValue = '';
    if ('static' in config) {
      newValue = config.static;
    }

    //get the corresponding HTML input element
    const inputEl = this._ardHost.inputs()[index];
    if (!inputEl) {
      throw new Error(
        "ARD-IS0048: <ard-digit-input>'s value changed, but its corresponding input element could not be found. If you are reading this, you probably experienced a problem with Ardium UI. Please report this issue to the creators."
      );
    }
    //update the input element and value array
    inputEl.nativeElement.value = newValue;

    this._internalValue.update(arr => {
      if (!arr) arr = [];
      const newArr = [...arr];
      newArr[index] = newValue || null;
      return newArr;
    });
  }

  //! validate against the config
  validateInputAndSetValue(input: string, index: number) {
    if (index < 0 || index > this._configArray().length) return null;

    const result = this._processCharacter(input, index);

    this._internalValue.update(arr => {
      if (!arr) arr = [];
      const newArr = [...arr];
      newArr[index] = result.resultChar || null;
      return newArr;
    });
    return result;
  }
  validateInputAndSetValueMultiple(value: string, startIndex: number, reset: boolean = false): void {
    if (startIndex < 0 || startIndex > this._configArray().length) return;

    const results = value.split('').map((char, i) => this._processCharacter(char, startIndex + i));

    this._internalValue.update(arr => {
      if (!arr) arr = [];
      const newArr = reset ? new Array(this._ardHost.inputs().length).fill(null) : [...arr];
      results.forEach((result, i) => {
        newArr[startIndex + i] = result.resultChar || null;
      });
      return newArr;
    });
  }
  private _processCharacter(char: string, index: number) {
    //prepare the characters before the current one (to be used in validation)
    const before = this.stringValue().charAt(index);

    //remove the old character from the input element
    if (before && char.length > 1 && char.match(before)) {
      char = char.replace(before, '');
    }
    //use only the first or last character (error safety)
    const firstChar = char.charAt(0);
    const lastChar = char.charAt(char.length - 1);
    char = firstChar === before ? lastChar : firstChar;

    //validate and transform, if necessary
    const inputChar = this._validateSingleChar(char, before, this._configArray()[index] as DigitInputAcceptObject);

    const newVal = inputChar ?? before;

    //get the corresponding HTML input element
    const inputEl = this._ardHost.inputs()[index];
    if (!inputEl) {
      // do not throw error before inputs have been initialized
      if (this._ardHost.inputs().length > 0) {
        throw new Error(
          "ARD-IS0048: <ard-digit-input>'s value changed, but its corresponding input element could not be found. If you are reading this, you probably experienced a problem with Ardium UI. Please report this issue to the creators."
        );
      }
    } else {
      //update the input element and value array
      inputEl.nativeElement.value = newVal ?? '';
    }
    return { wasChanged: newVal !== before, wasValidChar: !isNull(inputChar), resultChar: inputChar };
  }
  validateValueAndUpdate(): void {
    const v = this._internalValue();
    if (!v) return;

    let before = '';
    const newValue: (string | null)[] = [];
    for (let i = 0; i < Math.min(this._configArray().length, v.length); i++) {
      const char = v[i];
      before += char ?? ' ';

      if (!char) {
        newValue.push(char);
        continue;
      }
      const newChar = this._validateSingleChar(char, before, this._configArray()[i] as DigitInputAcceptObject);
      newValue.push(newChar);
    }
    this._internalValue.set(newValue);
  }
  private _validateSingleChar(char: string | null, before: string, config: DigitInputOption): string | null {
    // return the character if it is static
    if ('static' in config) return config.static;
    // for peace of mind protect against modifying read-only fields
    if (config.readonly) {
      throw new Error(
        `ARD-IS0049R: trying to set value of a <ard-digit-input>'s readonly field. This is error is fatal to the functioning of Ardium UI and should normally never occur. Please report this issue to the creators.`
      );
    }
    // process regex or convert string into regex
    if (!isFunction(config.accept)) {
      const regExp = isRegExp(config.accept) ? config.accept : new RegExp(`[${_sanitizeRegExpString(config.accept)}]`);
      config.accept = str => regExp.test(str);
    }
    if (!char) return char;

    // check if input fits the criteria
    const canAccept = config.accept(char, before);
    if (!canAccept) return null;

    // transform if needed
    const transform = config.transform ?? this._ardHost.transform();
    if (transform) {
      if (transform === TransformType.Lowercase) {
        return char.toLowerCase();
      }
      if (transform === TransformType.Uppercase) {
        return char.toUpperCase();
      }
      if (isFunction(transform)) {
        return transform(char).charAt(0);
      }
      console.warn(
        `ARD-IS0049T: <ard-digit-input>'s value validator encountered an unexpected value of the config's "transform" property. Ardium UI was able to handle this issue, but please report it to the creators.`
      );
    }
    return char;
  }
}
