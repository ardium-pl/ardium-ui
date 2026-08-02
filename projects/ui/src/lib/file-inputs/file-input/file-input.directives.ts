import { Directive, TemplateRef } from '@angular/core';
import { FormFieldFrameTemplateContext } from '../../form-field-frame';
import { FileInputBrowseContext, FileInputFilesContext } from '../file-input-types';

@Directive({ standalone: false, selector: 'ard-file-input > ng-template[ard-placeholder-tmp]' })
export class ArdFileInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-file-input > ng-template[ard-prefix-tmp]' })
export class ArdFileInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-file-input > ng-template[ard-suffix-tmp]' })
export class ArdFileInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-file-input > ng-template[ard-idle-content-tmp]' })
export class ArdiumFileInputIdleContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputBrowseContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-file-input > ng-template[ard-dragover-content-tmp]',
})
export class ArdiumFileInputDragoverContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputFilesContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-file-input > ng-template[ard-dropped-content-tmp]',
})
export class ArdiumFileInputUploadedContentTemplateDirective {
  constructor(public template: TemplateRef<FileInputFilesContext>) {}
}

@Directive({
  standalone: false,
  selector: 'ard-file-input > ng-template[ard-upload-icon-tmp]',
})
export class ArdiumFileInputUploadIconTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}
