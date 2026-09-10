import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    computed,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { Subject } from 'rxjs';
import { ARD_TABBER_DEFAULTS } from '../tabber.defaults';

@Component({
  standalone: false,
  selector: 'ard-tab',
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel',
    '[class.ard-tab-disabled]': 'disabled()',
    '[class.ard-tab-selected]': 'selected()',
  },
})
export class ArdiumTabComponent implements OnDestroy {
  protected readonly _DEFAULTS = inject(ARD_TABBER_DEFAULTS);

  readonly disabled = input<boolean, BooleanLike>(this._DEFAULTS.tabDisabled, { transform: v => coerceBooleanProperty(v) });

  readonly pointerEventsWhenDisabled = input<boolean, BooleanLike>(this._DEFAULTS.tabPointerEventsWhenDisabled, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly tabTitle = input<string>('');

  readonly selected = signal<boolean>(false);
  @Input('selected')
  set _selected(v: any) {
    this.selected.set(coerceBooleanProperty(v));
  }

  setSelected(state: boolean): void {
    this.selected.set(state);
    this._emitChange();
  }

  private _emitChange(): void {
    this.selectedChangeInternal$.next(this.selected());
  }

  readonly focused = signal<boolean>(false);

  readonly _label = input<string | TemplateRef<any> | null>(null, { alias: 'label' });
  readonly label = computed(() => this._label() ?? this.tabId());

  _isTabIdInitialized = false;
  readonly tabId = input.required<string, string>({
    transform: v => {
      this._isTabIdInitialized = true;
      return v;
    },
  });

  readonly focusEvent = output<void>({ alias: 'focus' });
  readonly blurEvent = output<void>({ alias: 'blur' });
  readonly selectedChange = output<boolean>();

  readonly selectedChangeInternal$ = new Subject<boolean>();

  private _selectedChangeSub = this.selectedChangeInternal$.subscribe(this.selectedChange.emit);
  ngOnDestroy(): void {
    this._selectedChangeSub.unsubscribe();
    this.selectedChangeInternal$.complete();
  }
}
