import { Component, ViewEncapsulation, signal } from '@angular/core';
import { CardAppearance, CardVariant, OneAxisAlignment } from '../../../../../ui/src/public-api';

@Component({
  standalone: false,
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardPage {
  readonly bearText =
    'The brown bear is a large bear living in much of northern Eurasia and North America. It is smaller than the polar bear, but is the largest carnivore which lives entirely on the land. There are several recognized subspecies.';

  readonly aligns: OneAxisAlignment[] = Object.values(OneAxisAlignment);
  readonly variants: CardVariant[] = Object.values(CardVariant);
  readonly appearances: CardAppearance[] = Object.values(CardAppearance);

  readonly likesBear = signal(false);

  toggleLikesBear() {
    this.likesBear.update(v => !v);
  }
}
