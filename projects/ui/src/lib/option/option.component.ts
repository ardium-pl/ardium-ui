import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation,
    computed,
    inject,
    input,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { Subject } from 'rxjs';
import { Nullable } from '../types/utility.types';

@Component({
  standalone: false,
  selector: 'ard-option',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumOptionComponent implements OnChanges, AfterViewChecked, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly value = input<any>(undefined);

  readonly hasImplicitValue = computed<boolean>(() => this.value() === undefined);

  readonly label = input<Nullable<string>>(undefined);

  get labelOrInnerHtml(): string {
    return this.label() ?? (this.elementRef.nativeElement.innerHTML || '').trim();
  }

  readonly disabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! state change listener
  readonly stateChange$ = new Subject<{
    value: any;
    oldValue?: string;
    disabled: boolean;
    label?: Nullable<string>;
  }>();

  private _previousLabel: Nullable<string>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled']) {
      this.stateChange$.next({
        value: this.value(),
        disabled: changes['disabled'].currentValue,
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.label() !== this._previousLabel) {
      let oldValue = this.value();
      if (this.hasImplicitValue()) oldValue = this._previousLabel;

      this._previousLabel = this.label();

      this.stateChange$.next({
        value: this.value(),
        oldValue,
        disabled: this.disabled(),
        label: this.label(),
      });
    }
  }

  ngOnDestroy(): void {
    this.stateChange$.complete();
  }
}
