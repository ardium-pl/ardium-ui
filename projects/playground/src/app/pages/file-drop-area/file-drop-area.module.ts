import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumFileDropAreaModule } from '../../../../../ui/src/public-api';
import { FileDropAreaPage } from './file-drop-area.page';

@NgModule({
  declarations: [FileDropAreaPage],
  imports: [CommonModule, ArdiumFileDropAreaModule],
})
export class FileDropAreaModule {}
