export type OptionContext<T extends ArdSimplestStorageItem> = {
  $implicit: T;
  item: T;
} & {
  [K in keyof Omit<T, 'filtered'>]: T[K];
};

export interface ForcedStructureOption {
  value: any;
  oldValue: any;
  label: string;
  disabled: boolean;
}

export interface ArdSimplestStorageItem {
  readonly itemData: object;
  readonly index: number;
  readonly value: any;
  readonly label: string;
  readonly selected: boolean;
  readonly highlighted: boolean;
}

export interface ArdOptionSimple extends ArdSimplestStorageItem {
  readonly disabled: boolean;
}

export interface ArdOption extends ArdOptionSimple {
  readonly group: unknown;
}

export interface ArdOptionGroup {
  readonly label: string;
  readonly disabled: boolean;
  readonly children: ArdOption[];
}

export const ArdPanelPosition = {
  Top: 'top',
  Bottom: 'bottom',
  Auto: 'auto',
} as const;
export type ArdPanelPosition = (typeof ArdPanelPosition)[keyof typeof ArdPanelPosition];

export type ArdItemGroupMap = Map<any, ArdOptionGroup>;

/**
 * Function used to determine the group label for an item, based on the item's data.
 */
export type GroupByFn = (item: any) => any;
/**
 * Function used to search for items based on a search term.
 *
 * Should return a tuple where the first value is a boolean indicating if the item matches the search term,
 * and the second value is a boolean indicating if the match is an exact match (used for auto-highlighting).
 */
export type SearchFn = (searchTerm: string, item: ArdOption) => [boolean, boolean];
/**
 * Function used to compare a value with an option's value to determine if they are considered equal.
 */
export type CompareWithFn = (value: any, optionValue: any) => boolean;
