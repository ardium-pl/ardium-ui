import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    ArdiumClickOutsideModule,
    ArdiumFilePipesModule
} from '@ardium-pl/devkit';
import { ArdiumButtonModule } from '../../buttons/button/button.module';
import { ArdiumIconModule } from '../../icon/icon.module';
import { ArdiumFileDropAreaComponent } from './file-drop-area.component';
import {
    ArdiumFileDropAreaDragoverContentTemplateDirective,
    ArdiumFileDropAreaIdleContentTemplateDirective,
    ArdiumFileDropAreaUploadedContentTemplateDirective,
} from './file-drop-area.directives';

@NgModule({
  declarations: [
    ArdiumFileDropAreaComponent,
    ArdiumFileDropAreaIdleContentTemplateDirective,
    ArdiumFileDropAreaDragoverContentTemplateDirective,
    ArdiumFileDropAreaUploadedContentTemplateDirective,
  ],
  imports: [
    CommonModule,
    ArdiumButtonModule,
    ArdiumIconModule,
    ArdiumFilePipesModule,
    ArdiumClickOutsideModule,
  ],
  exports: [
    ArdiumFileDropAreaComponent,
    ArdiumFileDropAreaIdleContentTemplateDirective,
    ArdiumFileDropAreaDragoverContentTemplateDirective,
    ArdiumFileDropAreaUploadedContentTemplateDirective,
  ],
})
export class ArdiumFileDropAreaModule {}
