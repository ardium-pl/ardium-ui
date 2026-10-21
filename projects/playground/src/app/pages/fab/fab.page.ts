import { Component } from '@angular/core';
import { ButtonAppearance as BA, ComponentColor as CC, FabSize as FS } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-fab',
  templateUrl: './fab.page.html',
  styleUrls: ['./fab.page.scss'],
})
export class FabPage {
  sizes: FS[] = Object.values(FS);
  appearances: BA[] = Object.values(BA);
  colors: CC[] = Object.values(CC);

  color: CC[] = [CC.Primary];
  appearance: BA[] = [BA.RaisedStrong];
  size: FS[] = [FS.Standard];
  extended: boolean = false;
  disabled: boolean = false;
  icon: string = 'favorite';
  text: string = '';

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
