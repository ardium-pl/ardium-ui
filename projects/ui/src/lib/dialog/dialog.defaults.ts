import { InjectionToken, Provider, Type } from '@angular/core';
import { _modalDefaults, ArdModalDefaults } from '../modal/modal.defaults';
import { ButtonAppearance } from './../buttons/general-button.types';
import { ComponentColor } from './../types/colors.types';
import { ArdDialogActionType, ArdDialogButtonsComponent } from './dialog.types';

export interface ArdDialogDefaults extends ArdModalDefaults {
  confirmButtonText: string;
  confirmButtonColor: ComponentColor;
  confirmButtonAppearance: ButtonAppearance;
  rejectButtonText: string;
  rejectButtonColor: ComponentColor;
  rejectButtonAppearance: ButtonAppearance;
  noRejectButton: boolean;
  canConfirm: boolean;
  buttonActionType: ArdDialogActionType;
  ButtonsComponent?: Type<ArdDialogButtonsComponent>;
}

const _dialogDefaults: ArdDialogDefaults = {
  ..._modalDefaults,
  confirmButtonText: 'Confirm',
  confirmButtonColor: ComponentColor.Primary,
  confirmButtonAppearance: ButtonAppearance.RaisedStrong,
  rejectButtonText: 'Cancel',
  rejectButtonColor: ComponentColor.None,
  rejectButtonAppearance: ButtonAppearance.Transparent,
  noRejectButton: false,
  canConfirm: true,
  buttonActionType: ArdDialogActionType.AutoClose,
  ButtonsComponent: undefined,
};

export const ARD_DIALOG_DEFAULTS = new InjectionToken<ArdDialogDefaults>('ard-dialog-defaults', {
  factory: () => ({
    ..._dialogDefaults,
  }),
});

export function provideDialogDefaults(config: Partial<ArdDialogDefaults>): Provider {
  return { provide: ARD_DIALOG_DEFAULTS, useValue: { ..._dialogDefaults, ...config } };
}
