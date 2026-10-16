import { Component } from '@angular/core';
import { ComponentColor as CC, ArdSlideToggleAppearance as STA } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.page.html',
  styleUrls: ['./slide-toggle.page.scss'],
})
export class SlideTogglePage {
  colors: CC[] = Object.values(CC);
  appearances: STA[] = Object.values(STA);

  fontsize: number = 24;

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
