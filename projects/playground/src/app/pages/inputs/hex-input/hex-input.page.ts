import { Component } from '@angular/core';
import { FormElementAppearance as FA, FormElementVariant as FV } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-hex-input',
  templateUrl: './hex-input.page.html',
  styleUrls: ['./hex-input.page.scss'],
})
export class HexInputPage {
  value: string | null = '#000000';

  appearances: FA[] = Object.values(FA);
  variants: FV[] = Object.values(FV);

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
