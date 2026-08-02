import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumAutocompleteInputModule, ArdiumIconModule } from 'projects/ui/src/public-api';
import { AutocompleteInputPage } from './autocomplete-input.page';
import { AutocompleteInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';

@NgModule({
  declarations: [AutocompleteInputPage],
  imports: [CommonModule, FormsModule, ArdiumAutocompleteInputModule, ArdiumIconModule, AutocompleteInputDefaultPrefixDemoComponent],
})
export class AutocompleteInputModule {}
