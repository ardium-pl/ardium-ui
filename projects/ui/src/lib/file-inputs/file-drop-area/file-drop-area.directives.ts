import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../../types/utility.types';
import { FileInputBrowseContext, FileInputFileAmountContext, FileInputFilesContext } from '../file-input-types';

@Directive({
  standalone: false,
  selector: 'ard-file-drop-area > ng-template[ard-idle-content-tmp]',
})
export class ArdiumFileDropAreaIdleContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputBrowseContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-file-drop-area > ng-template[ard-dragover-content-tmp]',
})
export class ArdiumFileDropAreaDragoverContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputFileAmountContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-file-drop-area > ng-template[ard-dropped-content-tmp]',
})
export class ArdiumFileDropAreaUploadedContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputFilesContext>) {}
}

export interface ArdFileDropAreaIdleContent extends TemplateComponent<FileInputBrowseContext> {}
export interface ArdFileDropAreaDragoverContent extends TemplateComponent<FileInputFileAmountContext> {}
export interface ArdFileDropAreaUploadedContent extends TemplateComponent<FileInputFilesContext> {}