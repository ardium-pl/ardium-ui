import { Component, ViewEncapsulation, inject } from '@angular/core';
import {
  BadgeSize as BS,
  BadgePosition,
  ComponentColor as CC,
  FormElementVariant as FEV,
} from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

const nbspString = '\xa0'.repeat(9);

@Component({
  standalone: false,
  selector: 'app-badge',
  templateUrl: './badge.page.html',
  styleUrls: ['./badge.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BadgePage {
  variants: FEV[] = [FEV.Rounded, FEV.Pill, FEV.Sharp];
  colors: CC[] = Object.values(CC);
  sizes: BS[] = Object.values(BS);
  positionItems = [
    { value: BadgePosition.AboveBefore, label: nbspString },
    { value: null, disabled: true, label: nbspString },
    { value: BadgePosition.AboveAfter, label: nbspString },
    { value: null, disabled: true, label: nbspString },
    { value: null, disabled: true, label: nbspString },
    { value: null, disabled: true, label: nbspString },
    { value: BadgePosition.BelowBefore, label: nbspString },
    { value: null, disabled: true, label: nbspString },
    { value: BadgePosition.BelowAfter, label: nbspString },
  ];

  log = inject(Logger).log;

  variant: FEV[] = [FEV.Pill];
  color: CC[] = [CC.Primary];
  size: BS[] = [BS.Medium];
  position: BadgePosition[] = [BadgePosition.AboveAfter];
  hidden: boolean = false;
  overlap: boolean = true;
  addTo: 'text' | 'button' = 'button';
  ariaLabel: string = 'Example badge';
  text: string = 'NEW!';
}
