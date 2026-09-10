import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
    computed,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import { isDefined } from 'simple-bool';
import { Nullable } from '../types/utility.types';
import { ARD_ICON_DEFAULTS } from './icon.defaults';

type WeightNumber = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type WeightString = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type Weight = WeightNumber | WeightString;

type GradeNumber = -25 | 0 | 200;
type GradeString = '-25' | '0' | '200';
export type Grade = GradeNumber | GradeString;

type OpticalSizeNumber = 20 | 24 | 40 | 48;
type OpticalSizeString = '20' | '24' | '40' | '48';
export type OpticalSize = OpticalSizeNumber | OpticalSizeString;

@Component({
  standalone: false,
  selector: 'ard-icon',
  templateUrl: `./icon.component.html`,
  styleUrls: ['./icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumIconComponent implements AfterViewInit {
  protected readonly _DEFAULTS = inject(ARD_ICON_DEFAULTS);

  readonly ariaLabel = input<string>('');
  readonly icon = input<Nullable<string>>(undefined);

  readonly filled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly weight = input<WeightNumber | undefined, Nullable<Weight>>(400, {
    transform: v => coerceNumberProperty(v, 400) as WeightNumber,
  });
  readonly grade = input<GradeNumber | undefined, Nullable<GradeNumber>>(0, {
    transform: v => coerceNumberProperty(v, 0) as GradeNumber,
  });
  readonly opticalSize = input<OpticalSizeNumber | undefined, Nullable<OpticalSize>>(40, {
    transform: v => coerceNumberProperty(v, 40) as OpticalSizeNumber,
  });

  readonly fontVariationSettings = computed<string>(() => {
    //map values to different properties defined by google icons
    const propObject = {
      FILL: isDefined(this.filled()) ? Number(this.filled()) : undefined,
      wght: this.weight(),
      GRAD: this.grade(),
      opsz: this.opticalSize(),
    };
    //map the object to an array of strings
    const propObjectAsArray = Object.entries(propObject) //object to array
      .filter(v => isDefined(v[1])) //filter undefined values
      .map(v => `"${v[0]}" ${v[1]}`) //map key-value pairs to strings
      .flat(); //flatten

    //create the final string only if any of the properties are defined
    return propObjectAsArray.length === 0 ? '' : ['font-variation-settings: ', propObjectAsArray.join(', ')].join('');
  });

  readonly contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapperEl');

  ngAfterViewInit(): void {
    if (!this.icon() && !this.contentWrapper()?.nativeElement.innerText) {
      console.warn(`ARD-FT9000: Using <ard-icon> without specifying the [icon] field.`);
    }
  }
}
