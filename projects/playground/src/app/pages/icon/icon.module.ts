import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumIconModule } from '../../../../../ui/src/public-api';
import { IconPage } from './icon.page';

@NgModule({
  declarations: [IconPage],
  imports: [CommonModule, FormsModule, ArdiumIconModule],
  exports: [IconPage],
})
export class IconModule {}
