import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FileInputFileTypes } from '../../../../../../ui/src/lib/file-inputs/file-input-types';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-file-input',
  templateUrl: './file-input.page.html',
  styleUrls: ['./file-input.page.scss'],
})
export class FileInputPage {
  readonly log = inject(Logger).log;

  readonly control = new FormControl<File | null>(null, [Validators.required]);
  readonly control2 = new FormControl<File | null>(null);
  readonly control3 = new FormControl<File | null>(null);

  readonly FILE_TYPES: FileInputFileTypes = [
    {
      description: 'Images',
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.svg', '.tiff'],
      }
    }
  ]

  onClickReset() {
    this.control3.reset();
  }
}
