import { Component, signal } from '@angular/core';
import { ComponentColor, SegmentAppearance, SegmentVariant } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-segment',
  templateUrl: './segment.page.html',
  styleUrls: ['./segment.page.scss'],
})
export class SegmentPage {
  options = ['Apple', 'Orange', 'Watermelon'];

  optionsComplex = [
    { type: 'bold', label: 'B', active: true },
    { type: 'italic', label: 'I', active: true },
    { type: 'underline', label: 'U', active: true },
    { type: 'strike', label: 'S', active: false },
  ];

  optionsAnimals = ['Cat', 'Dog', 'Rat', 'Fox', 'Bee', 'Bat'];

  optionsAlign = [
    { value: 'left', icon: 'format_align_left' },
    { value: 'center', icon: 'format_align_center' },
    { value: 'right', icon: 'format_align_right' },
    { value: 'justify', icon: 'format_align_justify' },
  ];

  readonly optionsPesel: any[] = [
    {
      label: 'PESEL',
      value: 'pesel',
    },
    {
      label: 'Birthdate',
      value: 'birthdate',
    },
  ];
  readonly peselOrBirthdate = signal<string>('pesel');

  appearances = Object.values(SegmentAppearance);
  variants = Object.values(SegmentVariant);
  colors = Object.values(ComponentColor);

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
