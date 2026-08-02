import { ArdOption, ArdOptionGroup, OptionContext } from '../types/item-storage.types';
import { TemplateComponent } from '../types/utility.types';

export type AddCustomFn<T> = (value: string) => T;

export interface ValueContext extends OptionContext<ArdOption> {
  unselect: () => void;
  itemsSelectedCount: number;
  totalItemsCount: number;
}

export interface PlaceholderContext {
  placeholder: string;
  $implicit: string;
}

export interface StatsContext {
  totalItems: number;
  foundItems?: number;
}

export interface SearchContext extends StatsContext {
  $implicit: string;
  searchTerm: string;
}

export interface CustomOptionContext {
  $implicit: string;
  searchTerm: string;
}

export interface GroupContext {
  $implicit: ArdOptionGroup;
  group: ArdOptionGroup;
  label: string;
  disabled: boolean;
  selectedChildrenCount: number;
  totalChildrenCount: number;
}

export interface ItemLimitContext {
  totalItems: number;
  selectedItems: number;
  itemLimit?: number;
}

export interface ItemDisplayLimitContext extends ItemLimitContext {
  overflowCount: number;
}

export interface ArdSelectOptionComponent extends TemplateComponent<OptionContext<ArdOption>> {}
export interface ArdSelectOptgroupComponent extends TemplateComponent<GroupContext> {}
export interface ArdSelectValueComponent extends TemplateComponent<ValueContext> {}
export interface ArdSelectPlaceholderComponent extends TemplateComponent<PlaceholderContext> {}
export interface ArdSelectDropdownArrowComponent extends TemplateComponent<{}> {}
export interface ArdSelectLoadingSpinnerComponent extends TemplateComponent<{}> {}
export interface ArdSelectLoadingPlaceholderComponent extends TemplateComponent<SearchContext> {}
export interface ArdSelectNoItemsFoundComponent extends TemplateComponent<SearchContext> {}
export interface ArdSelectAddCustomComponent extends TemplateComponent<CustomOptionContext> {}
export interface ArdSelectItemDisplayLimitComponent extends TemplateComponent<ItemDisplayLimitContext> {}
