import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumDialogModule, ArdiumSelectModule, ArdiumSlideToggleModule } from 'projects/ui/src/public-api';
import { DialogDefaultButtonsDemoComponent } from './default-buttons-component.component';
import { DialogPage } from './dialog.page';

@NgModule({
  declarations: [DialogPage],
  imports: [CommonModule, ArdiumDialogModule, ArdiumSelectModule, ArdiumSlideToggleModule, DialogDefaultButtonsDemoComponent],
})
export class DialogModule {}
