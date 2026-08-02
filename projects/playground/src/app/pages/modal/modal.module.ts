import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumModalModule, ArdiumSelectModule, ArdiumSlideToggleModule } from 'projects/ui/src/public-api';
import { ModalCloseIconDefaultComponent } from './close-icon-default-component.component';
import { ModalPage } from './modal.page';

@NgModule({
  declarations: [ModalPage],
  imports: [CommonModule, ArdiumModalModule, ArdiumSelectModule, ArdiumSlideToggleModule, ModalCloseIconDefaultComponent],
})
export class ModalModule {}
