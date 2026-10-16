import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, input } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-pl/devkit';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { ARD_STAR_DEFAULTS } from './star.defaults';
import { ArdStarIconTemplateDirective } from './star.directives';
import { ArdStarIconContext, StarColor, StarFillMode } from './star.types';

@Component({
  standalone: false,
  selector: 'ard-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumStarComponent {
  readonly wrapperClasses = input<string>('');

  protected readonly _DEFAULTS = inject(ARD_STAR_DEFAULTS);

  //! appearance
  readonly color = input<StarColor>(this._DEFAULTS.color);
  readonly filled = input<StarFillMode, StarFillMode | boolean | string | undefined>(
    this._transformFillMode(this._DEFAULTS.filled),
    {
      transform: this._transformFillMode,
    }
  );

  private _transformFillMode(value: StarFillMode | boolean | string | undefined): StarFillMode {
    if (value === StarFillMode.None || value === StarFillMode.Half || value === StarFillMode.Filled) {
      return value;
    }
    return coerceBooleanProperty(value) ? StarFillMode.Filled : StarFillMode.None;
  }

  readonly ngClasses = computed<string>(() =>
    [this.wrapperClasses(), `ard-color-${this.color()}`, `ard-star-fill-${this.filled()}`].join(' ')
  );

  //! template
  readonly iconTemplate = contentChild(ArdStarIconTemplateDirective);

  readonly iconTemplateContext = computed<ArdStarIconContext>(() => ({ $implicit: this.filled(), filled: this.filled() }));

  readonly iconComponent = this._DEFAULTS.StarIconComponent;

  readonly iconComponentInputs = contextToInputs(this.iconTemplateContext, this.iconComponent);
}
