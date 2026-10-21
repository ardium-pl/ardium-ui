export type ArdTransformerFn = (
  currentText: string,
  previousText: string,
  caretPos: number
) => { text: string; caretPos: number };

interface IRegExpTransformer {
  apply: ArdTransformerFn;
}
export class RegExpTransformer implements IRegExpTransformer {
  constructor(
    public regex: RegExp,
    public replace = '',
    public caretModif = 0
  ) {}

  apply(currentText: string, previousText: string, caretPos: number): { text: string; caretPos: number } {
    let text = currentText;
    if (text && this.regex) {
      let safetySwitch = 0;
      while (text.match(this.regex)) {
        //prevent infinite loop
        if (safetySwitch > 999) {
          console.error(this, new Error('Possible infinite loop in the above RegExpTransformer. Exited after 1000 iterations.'));
          break;
        }
        //apply regex
        const lengthBefore = text.length;
        text = text.replace(this.regex, this.replace);
        const lengthAfter = text.length;
        //fix caret pos
        caretPos += (lengthAfter - lengthBefore);
        //for infinite loop prevention
        safetySwitch++;
      }
    }
    return { text, caretPos };
  }
}

const toUpper: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  return { text: currentText.toUpperCase(), caretPos };
};
const toLower: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  return { text: currentText.toLowerCase(), caretPos };
};
const int: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  const regexes: ([RegExp] | [RegExp, string] | [RegExp, string, number])[] = [[/[^0-9-]/], [/(.+)-/, '$1']];
  let obj = { text: currentText, caretPos };
  for (const arr of regexes) {
    const [regex, replace, caretModif] = arr;
    obj = new RegExpTransformer(regex, replace, caretModif).apply(obj.text, previousText, obj.caretPos);
  }
  return obj;
};
const positiveInt: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  const regexes: ([RegExp] | [RegExp, string] | [RegExp, string, number])[] = [[/[^0-9]/]];
  let obj = { text: currentText, caretPos };
  for (const arr of regexes) {
    const [regex, replace, caretModif] = arr;
    obj = new RegExpTransformer(regex, replace, caretModif).apply(obj.text, previousText, obj.caretPos);
  }
  return obj;
};
const float: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  const regexes: ([RegExp] | [RegExp, string] | [RegExp, string, number])[] = [
    [/[^0-9.]/],
    [/\.(.*)\./, '$1.'],
    [/^\./, '$10.'],
  ];
  let obj = { text: currentText, caretPos };
  for (const arr of regexes) {
    const [regex, replace, caretModif] = arr;
    obj = new RegExpTransformer(regex, replace, caretModif).apply(obj.text, previousText, obj.caretPos);
  }
  return obj;
};
const positiveFloat: ArdTransformerFn = (currentText: string, previousText: string, caretPos: number) => {
  const regexes: ([RegExp] | [RegExp, string] | [RegExp, string, number])[] = [
    [/[^0-9.-]/],
    [/(.+)-/, '$1'],
    [/\.(.*)\./, '$1.'],
    [/^(-?)\./, '$10.'],
  ];
  let obj = { text: currentText, caretPos };
  for (const arr of regexes) {
    const [regex, replace, caretModif] = arr;
    obj = new RegExpTransformer(regex, replace, caretModif).apply(obj.text, previousText, obj.caretPos);
  }
  return obj;
};
export const ArdTransformer = {
  ToUpper: toUpper,
  ToLower: toLower,
  Integer: int,
  PositiveInteger: positiveInt,
  Float: float,
  PositiveFloat: positiveFloat,
} as const;
