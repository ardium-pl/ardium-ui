import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OutputRefSubscription,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  forwardRef,
  model,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TakeChance as Random } from 'take-chance';
import { _FormFieldComponentBase, _formFieldComponentDefaults } from '../_internal/form-field-component';
import { ARD_FORM_FIELD_CONTROL } from '../form-field/form-field-child.token';
import { Nullable } from '../types/utility.types';
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
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumRadioGroupComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumRadioGroupComponent,
    },
  ],
})
export class ArdiumRadioGroupComponent extends _FormFieldComponentBase implements AfterContentInit, OnDestroy {
  private readonly _radios = contentChildren<ArdiumRadioComponent>(ArdiumRadioComponent, { descendants: true });

  @HostBinding('attr.id')
  get _htmlIdHostAttribute() {
    return this.htmlId();
  }

  constructor() {
    super(_formFieldComponentDefaults); // no need for injecting a token with default values

    effect(() => {
      this.name();
      this._updateRadioButtonNames();
    });
    effect(() => {
      this.readonly();
      this._updateReadonlyRadioButtons();
    });
    effect(() => {
      this.selected();
      this._checkSelectedRadioButton();
    });
    effect(() => {
      const radios = this._radios();
      if (!radios) return;

      setTimeout(() => {
        this._updateRadioButtonNames();
      }, 0);

      this._destroyChildSubscriptions();

      //sub to child component events
      for (const radio of radios) {
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
    });
  }

  //! value
  @Input()
  get value(): any | undefined {
    return this.selected()?.value();
  }
  set value(v: any) {
    this.writeValue(v);
  }

  readonly valueChange = output<any>();
  readonly changeEvent = output<any>({ alias: 'change' });

  private _valueBeforeInit: any;
  writeValue(v: any): void {
    if (this.value !== v) {
      if (!this._isContentInit) {
        this._valueBeforeInit = v;
        return;
      }

      this._findRadioByValue(v);
    }
    setTimeout(() => {
      this._updateRadiosByValue();
    }, 0);
  }

  private _findRadioByValue(v: any): void {
    if (!this._radios) return;

    this.selected.set(this._radios().find(radio => v === radio.value()) ?? null);
  }

  /** Updates all child radios depending on the currently selected radio. */
  private _updateRadiosByValue(): void {
    if (!this._isContentInit) return;

    this._radios().forEach(radio => {
      radio.selected.set(this.value === radio.value());
      radio.markForCheck();
    });
  }

  /**
   * The currently selected radio button. If set to a new radio button, the radio group value
   * will be updated to match the new selected button.
   */
  readonly selected = model<Nullable<ArdiumRadioComponent>>(null);

  private _checkSelectedRadioButton() {
    const s = this.selected();
    if (s && !s.selected()) {
      s.selected.set(true);
      s.markForCheck();
    }
  }

  //! name
  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  readonly name = computed<string>(() => this.htmlName() ?? Random.id());

  private _updateRadioButtonNames(): void {
    if (this._radios()) {
      this._radios().forEach(radio => {
        radio.name.set(this.name());
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

  //! update handlers
  private _handleBlurEvents(event: FocusEvent): void {
    this.onBlur(event);
  }
  private _handleFocusEvents(event: FocusEvent): void {
    this.onFocus(event);
  }
  private _handleChangeEvents(selected: ArdiumRadioComponent): void {
    this.writeValue(selected.value());

    this._emitChange();
  }

  protected _emitChange(): void {
    const v = this.value;
    this._onChangeRegistered?.(v);
    this.changeEvent.emit(v);
    this.valueChange.emit(v);
  }

  //! hooks
  private _childEventSubs: OutputRefSubscription[] = [];
  private _isContentInit = false;
  ngAfterContentInit(): void {
    this._isContentInit = true;

    if (this._valueBeforeInit !== undefined) {
      this.writeValue(this._valueBeforeInit);
    }

    setTimeout(() => {
      this._updateRadioButtonNames();
    }, 0);

    //sub to child component events
    for (const radio of this._radios()) {
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
