import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumFilePipesModule } from '@ardium-pl/devkit';
import { _ClearButtonModule } from '../../_internal/clear-button/clear-button.module';
import { ArdiumFormFieldFrameModule } from '../../form-field-frame/form-field-frame.module';
import { ArdiumIconModule } from '../../icon/icon.module';
import { ArdiumFileInputComponent } from './file-input.component';
import {
    ArdFileInputPlaceholderTemplateDirective,
    ArdFileInputPrefixTemplateDirective,
    ArdFileInputSuffixTemplateDirective,
    ArdiumFileInputDragoverContentTemplateDirective,
    ArdiumFileInputIdleContentTemplateDirective,
    ArdiumFileInputUploadedContentTemplateDirective,
    ArdiumFileInputUploadIconTemplateDirective,
} from './file-input.directives';

@NgModule({
  declarations: [
    ArdiumFileInputComponent,
    ArdiumFileInputUploadIconTemplateDirective,
    ArdiumFileInputUploadedContentTemplateDirective,
    ArdiumFileInputDragoverContentTemplateDirective,
    ArdiumFileInputIdleContentTemplateDirective,
    ArdFileInputSuffixTemplateDirective,
    ArdFileInputPrefixTemplateDirective,
    ArdFileInputPlaceholderTemplateDirective,
  ],
  imports: [CommonModule, ArdiumFormFieldFrameModule, _ClearButtonModule, ArdiumIconModule, ArdiumFilePipesModule],
  exports: [
    ArdiumFileInputComponent,
    ArdiumFileInputUploadIconTemplateDirective,
    ArdiumFileInputUploadedContentTemplateDirective,
    ArdiumFileInputDragoverContentTemplateDirective,
    ArdiumFileInputIdleContentTemplateDirective,
    ArdFileInputSuffixTemplateDirective,
    ArdFileInputPrefixTemplateDirective,
    ArdFileInputPlaceholderTemplateDirective,
  ],
})
export class ArdiumFileInputModule {}
