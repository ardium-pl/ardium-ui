import { Component, input } from '@angular/core';
import {
  ArdSelectNoItemsFoundComponent,
  ArdSelectOptionComponent,
  ArdSelectDropdownArrowComponent,
  ArdSelectPlaceholderComponent,
  ArdiumSelectModule,
  provideSelectDefaults,
} from 'projects/ui/src/public-api';
import { OptionContext } from 'projects/ui/src/lib/types/item-storage.types';
import { ArdOption } from 'projects/ui/src/lib/types/item-storage.types';
import { PlaceholderContext, SearchContext } from 'projects/ui/src/lib/select/select.types';

// Example 1: Custom option component
@Component({
  selector: 'app-select-default-option',
  template: `⭐ {{ label() }}`,
  standalone: true,
})
export class SelectDefaultOptionComponent implements ArdSelectOptionComponent {
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);
}

@Component({
  selector: 'app-select-default-option-demo',
  template: `<ard-select [items]="items" searchable />`,
  standalone: true,
  imports: [ArdiumSelectModule],
  providers: [
    provideSelectDefaults({
      OptionComponent: SelectDefaultOptionComponent,
    }),
  ],
})
export class SelectDefaultOptionDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit', 'Mango'];
}

// Example 2: Custom placeholder component
@Component({
  selector: 'app-select-default-placeholder',
  template: `<span style="font-style: italic; opacity: 0.6">{{ placeholder() }}</span>`,
  standalone: true,
})
export class SelectDefaultPlaceholderComponent implements ArdSelectPlaceholderComponent {
  readonly placeholder = input<string>('');
}

@Component({
  selector: 'app-select-default-placeholder-demo',
  template: `<ard-select [items]="items" placeholder="Pick a fruit..." />`,
  standalone: true,
  imports: [ArdiumSelectModule],
  providers: [
    provideSelectDefaults({
      PlaceholderComponent: SelectDefaultPlaceholderComponent,
    }),
  ],
})
export class SelectDefaultPlaceholderDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}

// Example 3: Custom dropdown arrow component
@Component({
  selector: 'app-select-default-dropdown-arrow',
  template: `▾`,
  standalone: true,
})
export class SelectDefaultDropdownArrowComponent implements ArdSelectDropdownArrowComponent {}

@Component({
  selector: 'app-select-default-dropdown-arrow-demo',
  template: `<ard-select [items]="items" />`,
  standalone: true,
  imports: [ArdiumSelectModule],
  providers: [
    provideSelectDefaults({
      DropdownArrowComponent: SelectDefaultDropdownArrowComponent as any,
    }),
  ],
})
export class SelectDefaultDropdownArrowDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}

// Example 4: Custom no items found component
@Component({
  selector: 'app-select-default-no-items-found',
  template: `<div style="padding: 8px; font-style: italic">🔍 Nothing matches "{{ searchTerm() }}"</div>`,
  standalone: true,
})
export class SelectDefaultNoItemsFoundComponent implements ArdSelectNoItemsFoundComponent {
  readonly searchTerm = input<string>('');
}

@Component({
  selector: 'app-select-default-no-items-found-demo',
  template: `<ard-select [items]="items" searchable />`,
  standalone: true,
  imports: [ArdiumSelectModule],
  providers: [
    provideSelectDefaults({
      NoItemsFoundComponent: SelectDefaultNoItemsFoundComponent,
    }),
  ],
})
export class SelectDefaultNoItemsFoundDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}
