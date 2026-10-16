import { Component, viewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ArdiumDigitInputComponent, DigitInputConfig, DigitInputPrimitiveOption, TransformType } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-digit-input',
  templateUrl: './digit-input.page.html',
  styleUrls: ['./digit-input.page.scss'],
})
export class DigitInputPage {
  readonly digitInput = viewChild<ArdiumDigitInputComponent>('digit');

  constructor(private _logger: Logger) {
    // setTimeout(() => {
    //   this.group.controls.zipCode.setValue('44-100');
    //   console.log('%cSet value to 44-100', 'color:yellow');
    // }, 3000);
    // setInterval(() => {
    //   console.log('digit value', this.group.controls.zipCode.value, (this.digitInput() as any).model.value());
    // }, 1000);
    setTimeout(() => {
      this.group.controls.zipCode.reset();
      console.log('reset');
    }, 3000);
  }
  log = this._logger.log;

  readonly control = new FormControl();
  readonly group = new FormGroup({
    zipCode: new FormControl('00-102'),
    zipCodeDisabled: new FormControl({ value: '00-102', disabled: true }),
  });

  readonly simpleConfig = 'letter,number,number,number';

  readonly complexConfig: DigitInputConfig = [
    {
      accept: 'a-fA-F0-9',
      transform: TransformType.Uppercase,
      placeholder: '0',
    },
    {
      accept: 'a-fA-F0-9',
      transform: TransformType.Uppercase,
      placeholder: '0',
    },
    {
      accept: 'a-fA-F0-9',
      transform: TransformType.Uppercase,
      placeholder: '0',
    },
    {
      accept: 'a-fA-F0-9',
      transform: TransformType.Uppercase,
      placeholder: '0',
    },
  ];

  readonly configWithStatics: DigitInputConfig = [
    DigitInputPrimitiveOption.Number,
    DigitInputPrimitiveOption.Number,
    { static: '-' },
    DigitInputPrimitiveOption.Number,
    DigitInputPrimitiveOption.Number,
    DigitInputPrimitiveOption.Number,
  ];
}
