import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { Nullable } from '../types/utility.types';

@Component({
  standalone: false,
  selector: 'ard-option',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumOptionComponent implements OnChanges {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _innerHtml = signal('');

  constructor() {
    afterNextRender(() => {
      const element = this.element.nativeElement;

      const updateLabel = () => {
        this._innerHtml.set(element.textContent?.trim() ?? '');
      };

      updateLabel();

      const observer = new MutationObserver(updateLabel);

      observer.observe(element, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  readonly value = input.required<any>();
  readonly oldValue = signal<any>(undefined);

  readonly label = input<Nullable<string>>(undefined);
  readonly labelOrInnerHtml = computed<string>(() => this.label() ?? this._innerHtml());

  readonly disabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].isFirstChange()) {
      this.oldValue.set(changes['value'].previousValue);
    }
  }
}
