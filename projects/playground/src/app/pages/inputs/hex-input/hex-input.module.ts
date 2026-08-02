import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumHexInputModule, ArdiumIconModule } from 'projects/ui/src/public-api';
import { HexInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { HexInputPage } from './hex-input.page';

@NgModule({
  declarations: [HexInputPage],
  imports: [CommonModule, FormsModule, ArdiumHexInputModule, ArdiumIconModule, HexInputDefaultPrefixDemoComponent],
})
export class HexInputModule {}
