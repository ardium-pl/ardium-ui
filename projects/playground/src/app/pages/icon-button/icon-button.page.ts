import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentColor as CC } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-icon-button',
  templateUrl: './icon-button.page.html',
  styleUrls: ['./icon-button.page.scss'],
  host: {
    '[class.alt-coloring]': 'altColoring',
  },
  encapsulation: ViewEncapsulation.None,
})
export class IconButtonPage {
  altColoring = false;

  colors: CC[] = Object.values(CC);

  color: CC[] = [CC.Primary];
  compact: boolean = false;
  disabled: boolean = false;
  private _icon: string | null = 'favorite';
  public get icon(): string | null {
    return this._icon;
  }
  public set icon(value: string | null) {
    this._icon = value;
  }
  text: string | null = null;

  constructor(private _logger: Logger) {}
  log = this._logger.log;
}
