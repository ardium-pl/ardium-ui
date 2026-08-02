import { Component } from '@angular/core';
import {
  ArdiumAutocompleteInputModule,
  provideAutocompleteInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-autocomplete-input-default-prefix',
  template: `★`,
  standalone: true,
})
export class AutocompleteInputDefaultPrefixComponent {}

@Component({
  selector: 'app-autocomplete-input-default-prefix-component',
  template: `<ard-autocomplete-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumAutocompleteInputModule],
  providers: [
    provideAutocompleteInputDefaults({
      PrefixComponent: AutocompleteInputDefaultPrefixComponent as any,
    }),
  ],
})
export class AutocompleteInputDefaultPrefixDemoComponent {}
