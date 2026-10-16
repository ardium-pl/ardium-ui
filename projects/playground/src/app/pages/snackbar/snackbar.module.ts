import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumButtonModule, ArdiumSnackbarService } from '../../../../../ui/src/public-api';
import { SnackbarPage } from './snackbar.page';

@NgModule({
  declarations: [SnackbarPage],
  imports: [CommonModule, ArdiumButtonModule],
  providers: [ArdiumSnackbarService],
})
export class SnackbarModule {}
