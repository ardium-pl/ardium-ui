import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumFileInputModule, ArdiumFormFieldModule } from 'projects/ui/src/public-api';
import { FileInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { FileInputPage } from './file-input.page';

@NgModule({
  declarations: [FileInputPage],
  imports: [CommonModule, ArdiumFileInputModule, ReactiveFormsModule, ArdiumFormFieldModule, FileInputDefaultPrefixDemoComponent],
})
export class FileInputModule {}
