export const CaseTransformerType = {
  NoChange: 'nochange',
  Uppercase: 'uppercase',
  Lowercase: 'lowercase',
} as const;
export type CaseTransformerType = (typeof CaseTransformerType)[keyof typeof CaseTransformerType];

export const ArdInputType = {
  Text: 'text',
  Password: 'password',
  Email: 'email',
  Tel: 'tel',
  Url: 'url',
  Search: 'search',
} as const;
export type ArdInputType = (typeof ArdInputType)[keyof typeof ArdInputType];