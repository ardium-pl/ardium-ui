import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumChipModule, ArdiumIconModule, ArdiumOptionModule, ArdiumSelectModule } from 'projects/ui/src/public-api';
import { SelectDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { SelectPage } from './select.page';

@NgModule({
  declarations: [SelectPage],
  imports: [CommonModule, ArdiumSelectModule, ArdiumOptionModule, ArdiumIconModule, ReactiveFormsModule, ArdiumChipModule, SelectDefaultPrefixDemoComponent],
})
export class SelectModule {}
