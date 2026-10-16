import { Component, model } from '@angular/core';
import { ArdModalCloseIcon, ArdiumCheckboxModule, ArdiumModalModule, provideModalDefaults } from '../../../../../ui/src/public-api';

@Component({
  selector: 'app-modal-close-icon-default',
  template: `×`,
  standalone: true,
})
export class ModalCloseIconDefault implements ArdModalCloseIcon {}

@Component({
  selector: 'app-modal-close-icon-default-component',
  template: `<ard-modal
    heading="Heading"
    [(open)]="open"
  >
    Modal content
  </ard-modal>`,
  standalone: true,
  imports: [ArdiumCheckboxModule, ArdiumModalModule],
  providers: [
    provideModalDefaults({
      CloseIconComponent: ModalCloseIconDefault,
    }),
  ],
})
export class ModalCloseIconDefaultComponent {
  readonly open = model<boolean>();
}
