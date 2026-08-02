import { Component, input, model } from '@angular/core';
import {
  ArdDialogButtonsComponent,
  ArdiumDialogModule,
  provideDialogDefaults,
} from 'projects/ui/src/public-api';
import { DialogButtonsContext } from 'projects/ui/src/lib/dialog/dialog.types';

@Component({
  selector: 'app-dialog-default-buttons',
  template: `
    <div style="display: flex; gap: 8px; justify-content: flex-end">
      @if (rejectButton().enabled) {
        <button (click)="onReject()()">{{ rejectButton().text }}</button>
      }
      <button (click)="onConfirm()()" [disabled]="!canConfirm()">{{ confirmButton().text }}</button>
    </div>
  `,
  standalone: true,
})
export class DialogDefaultButtonsComponent implements ArdDialogButtonsComponent {
  readonly confirmButton = input<DialogButtonsContext['confirmButton']>({ text: 'Confirm', color: 'primary', appearance: 'raised-strong', pointerEventsWhenDisabled: false });
  readonly rejectButton = input<DialogButtonsContext['rejectButton']>({ enabled: true, text: 'Cancel', color: 'none', appearance: 'transparent' });
  readonly canConfirm = input<boolean>(true);
  readonly onConfirm = input<() => void>(() => {});
  readonly onReject = input<() => void>(() => {});
}

@Component({
  selector: 'app-dialog-default-buttons-component',
  template: `
    <button (click)="open.set(true)">Open dialog</button>
    <ard-dialog heading="Custom buttons" [(open)]="open">Dialog content</ard-dialog>
  `,
  standalone: true,
  imports: [ArdiumDialogModule],
  providers: [
    provideDialogDefaults({
      ButtonsComponent: DialogDefaultButtonsComponent,
    }),
  ],
})
export class DialogDefaultButtonsDemoComponent {
  open = model<boolean>(false);
}
