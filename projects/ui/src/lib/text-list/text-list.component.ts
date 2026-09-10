import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';

@Component({
  standalone: false,
  selector: 'ard-text-list',
  templateUrl: './text-list.component.html',
  styleUrl: './text-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumTextListComponent {
  readonly values = input.required<any[]>();

  readonly separator = input<string>(', ');

  readonly filter = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
