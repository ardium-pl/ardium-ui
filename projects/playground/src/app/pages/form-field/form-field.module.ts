import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumDigitInputModule, ArdiumFileInputModule, ArdiumFormFieldModule, ArdiumInputModule, ArdiumNumberInputModule, ArdiumRadioModule, ArdiumSegmentModule, ArdiumSelectModule, provideErrorMap } from '../../../../../ui/src/public-api';
import { FormFieldPage } from './form-field.page';

@NgModule({
  declarations: [FormFieldPage],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArdiumFormFieldModule,
    ArdiumInputModule,
    ArdiumSelectModule,
    ArdiumDigitInputModule,
    ArdiumSegmentModule,
    ArdiumInputModule,
    ArdiumInputModule,
    ArdiumSelectModule,
    ArdiumRadioModule,
    ArdiumNumberInputModule,
    ArdiumFileInputModule,
  ],
  providers: [
    provideErrorMap({
      required: 'This field is required',
      pattern: 'Invalid format',
      minlength: errorData => `Minimum length is ${errorData.requiredLength}`,
      maxlength: errorData => `Maximum length is ${errorData.requiredLength}`,
    }),
  ],
})
export class FormFieldModule {}
