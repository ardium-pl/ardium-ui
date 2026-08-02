import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { ButtonAppearance } from '../buttons/general-button.types';
import { ComponentColor } from '../types/colors.types';
import { PanelAppearance, PanelVariant } from '../types/theming.types';
import { ARD_DIALOG_DEFAULTS } from './dialog.defaults';
import { ArdDialogButtonsTemplateDirective, ArdDialogCloseIconTemplateDirective } from './dialog.directives';
import { ArdDialogActionType, ArdDialogResult, DialogButtonsContext } from './dialog.types';

@Component({
  standalone: false,
  selector: 'ard-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumDialogComponent {
  private readonly _DEFAULTS = inject(ARD_DIALOG_DEFAULTS);

  //! appearance
  //all handled by modal component
  readonly appearance = input<PanelAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<PanelVariant>(this._DEFAULTS.variant);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  //! heading
  //all handled by modal component
  readonly heading = input<string>(this._DEFAULTS.heading);

  readonly noCloseButton = input<boolean, BooleanLike>(this._DEFAULTS.noCloseButton, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly panelClass = input<string>(this._DEFAULTS.panelClass);
  readonly backdropClass = input<string>(this._DEFAULTS.backdropClass);

  //! options
  //all handled by modal component
  readonly noBackdrop = input<boolean, BooleanLike>(this._DEFAULTS.noBackdrop, { transform: v => coerceBooleanProperty(v) });
  readonly disableBackdropClose = input<boolean, BooleanLike>(this._DEFAULTS.disableBackdropClose, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly buttonActionType = input<ArdDialogActionType>(this._DEFAULTS.buttonActionType);

  readonly allActionsDisabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! open state handling
  //all handled by modal component
  readonly open = model<boolean>(false);

  readonly closeEvent = output<ArdDialogResult>({ alias: 'close' });
  readonly confirmEvent = output<void>({ alias: 'confirm' });
  readonly rejectEvent = output<void>({ alias: 'reject' });

  openProgrammatically() {
    this.open.set(true);
  }
  closeProgrammatically() {
    this.open.set(false);
  }

  //! button settings
  readonly confirmButtonText = input<string>(this._DEFAULTS.confirmButtonText);
  readonly confirmButtonColor = input<ComponentColor>(this._DEFAULTS.confirmButtonColor);
  readonly confirmButtonAppearance = input<ButtonAppearance>(this._DEFAULTS.confirmButtonAppearance);
  readonly confirmButtonPointerEventsWhenDisabled = input<boolean, BooleanLike>(false, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly rejectButtonText = input<string>(this._DEFAULTS.rejectButtonText);
  readonly rejectButtonColor = input<ComponentColor>(this._DEFAULTS.rejectButtonColor);
  readonly rejectButtonAppearance = input<ButtonAppearance>(this._DEFAULTS.rejectButtonAppearance);

  readonly noRejectButton = input<boolean, BooleanLike>(this._DEFAULTS.noRejectButton, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly canConfirm = input<boolean, BooleanLike>(this._DEFAULTS.canConfirm, { transform: v => coerceBooleanProperty(v) });

  private _isCloseEventTimeoutRunning = false;
  onConfirmClick() {
    if (!this.canConfirm() || this.allActionsDisabled()) return;

    this._isCloseEventTimeoutRunning = true;

    if (this.buttonActionType() === ArdDialogActionType.AutoClose) {
      this.open.set(false);
    }
    setTimeout(() => {
      this._isCloseEventTimeoutRunning = false;
      this.confirmEvent.emit();
      this.closeEvent.emit('confirm');
    }, 0);
  }
  onRejectClick() {
    if (this.allActionsDisabled()) return;

    this._isCloseEventTimeoutRunning = true;

    if (this.buttonActionType() === ArdDialogActionType.AutoClose) {
      this.open.set(false);
    }
    setTimeout(() => {
      this._isCloseEventTimeoutRunning = false;
      this.rejectEvent.emit();
      this.closeEvent.emit('reject');
    }, 0);
  }
  onModalClose() {
    if (this._isCloseEventTimeoutRunning) return;
    this.closeEvent.emit('close');
  }

  //! templates
  readonly buttonsTemplate = contentChild(ArdDialogButtonsTemplateDirective);

  readonly closeIconTemplate = contentChild(ArdDialogCloseIconTemplateDirective);

  readonly getButtonsContext = computed<DialogButtonsContext>(() => {
    return {
      confirmButton: {
        text: this.confirmButtonText(),
        color: this.confirmButtonColor(),
        appearance: this.confirmButtonAppearance(),
        pointerEventsWhenDisabled: this.confirmButtonPointerEventsWhenDisabled(),
      },
      rejectButton: {
        enabled: !this.noRejectButton(),
        text: this.rejectButtonText(),
        color: this.rejectButtonColor(),
        appearance: this.rejectButtonAppearance(),
      },
      canConfirm: this.canConfirm(),
      allActionsDisabled: this.allActionsDisabled(),
      onConfirm: () => this.onConfirmClick(),
      onReject: () => this.onRejectClick(),
      dialogAppearance: this.appearance(),
      dialogVariant: this.variant(),
      dialogCompact: this.compact(),
    };
  });

  readonly buttonsComponent = this._DEFAULTS.ButtonsComponent;
  readonly buttonsComponentInputs = contextToInputs(this.getButtonsContext, this.buttonsComponent);
}
