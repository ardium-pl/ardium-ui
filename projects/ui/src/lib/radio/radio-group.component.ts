import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OutputRefSubscription,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  model,
  untracked
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TakeChance as Random } from 'take-chance';
import { _FormFieldComponentBase, _formFieldComponentDefaults } from '../_internal/form-field-component';
import { ARD_FORM_FIELD_CONTROL } from '../form-field/form-field-child.token';
import { ArdiumRadioComponent } from './radio/radio.component';

@Component({
  standalone: false,
  selector: 'ard-radio-group',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./radio-group.component.scss'],
  host: {
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    role: 'radiogroup',
  },
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumRadioGroupComponent,
    },
  ],
})
export class ArdiumRadioGroupComponent
  extends _FormFieldComponentBase
  implements OnDestroy, Omit<FormValueControl<any>, 'readonly' | 'disabled' | 'required'>
{
  private readonly _radios = contentChildren<ArdiumRadioComponent>(ArdiumRadioComponent, { descendants: true });

  @HostBinding('attr.id')
  get _htmlIdHostAttribute() {
    return this.htmlId();
  }

  constructor() {
    super(_formFieldComponentDefaults); // no need for injecting a token with default values

    effect(() => {
      this.nameOrGenerated();
      this._updateRadioButtonNames();
    });
    effect(() => {
      this.readonly();
      this._updateReadonlyRadioButtons();
    });
    effect(() => {
      const radios = this._radios();
      if (!radios) return;

      setTimeout(() => {
        this._updateRadioButtonNames();
      }, 0);

      this._destroyChildSubscriptions();
      this._subscribeToRadioButtonEvents();
    });
    effect(() => {
      this.value();
      this._updateRadioButtonsSelected();
    });

    console.log('ArdiumRadioGroupComponent initialized');
    console.log('ArdiumRadioGroupComponent initialized');
  }

  //! value
  readonly value = model<any>(null);

  //! name
  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  readonly nameOrGenerated = computed<string>(() => this.name() || Random.id());

  //! updaters
  private _updateRadioButtonNames(): void {
    if (this._radios()) {
      this._radios().forEach(radio => {
        radio.name.set(this.nameOrGenerated());
        radio.markForCheck();
      });
    }
  }
  private _updateReadonlyRadioButtons(): void {
    if (this._radios()) {
      this._radios().forEach(radio => {
        radio._readonly.set(this.readonly());
        radio.markForCheck();
      });
    }
  }
  private _updateRadioButtonsSelected(): void {
    const value = this.value();
    if (this._radios()) {
      this._radios().forEach(radio => {
        radio.selected.set(value === radio.value());
        radio.markForCheck();
      });
    }
  }
  private _subscribeToRadioButtonEvents(): void {
    const radios = this._radios();
    if (!radios) return;

    for (const radio of radios) {
      if (untracked(() => radio.selected())) {
        this._handleChangeEvents(radio);
      }

      this._childEventSubs.push(
        radio.blurEvent.subscribe(v => {
          this._handleBlurEvents(v);
        })
      );
      this._childEventSubs.push(
        radio.focusEvent.subscribe(v => {
          this._handleFocusEvents(v);
        })
      );
      this._childEventSubs.push(
        radio.selectedChange.subscribe((v: boolean) => {
          if (!v) return;
          this._handleChangeEvents(radio);
        })
      );
      this._childEventSubs.push(
        radio.touchedEvent.subscribe(() => {
          this._emitTouched();
        })
      );
    }
  }

  //! update handlers
  private _handleBlurEvents(event: FocusEvent): void {
    this.onBlur(event);
  }
  private _handleFocusEvents(event: FocusEvent): void {
    this.onFocus(event);
  }
  private _handleChangeEvents(selected: ArdiumRadioComponent): void {
    this.value.set(selected.value());
  }

  //! hooks
  private _childEventSubs: OutputRefSubscription[] = [];
  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._destroyChildSubscriptions();
  }
  private _destroyChildSubscriptions(): void {
    for (const sub of this._childEventSubs) {
      sub.unsubscribe();
    }
    this._childEventSubs = [];
  }
}
