import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonAppearance as BA, ButtonVariant as BV, ComponentColor as CC } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-button',
  templateUrl: './button.page.html',
  styleUrls: ['./button.page.scss'],
  host: {
    '[class.alt-coloring]': 'altColoring',
  },
  encapsulation: ViewEncapsulation.None,
})
export class ButtonPage {
  altColoring = false;

  variants: BV[] = [BV.Rounded, BV.Pill, BV.Sharp];
  appearances: BA[] = Object.values(BA);
  colors: CC[] = Object.values(CC);

  appearance: BA[] = [BA.Raised];
  variant: BV[] = [BV.Rounded];
  color: CC[] = [CC.Primary];
  compact: boolean = false;
  vertical: boolean = false;
  disabled: boolean = false;
  text: string | null = 'Text';

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
