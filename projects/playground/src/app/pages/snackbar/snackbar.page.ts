import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ArdiumSnackbarService, ArdSnackbarAlignment, ArdSnackbarOriginRelation, ArdSnackbarQueueHandling, ArdSnackbarRef, ArdSnackbarType } from '../../../../../ui/src/public-api';

@Component({
  standalone: false,
  selector: 'app-snackbar',
  templateUrl: './snackbar.page.html',
  styleUrl: './snackbar.page.scss',
})
export class SnackbarPage {
  private readonly _snackbarService = inject(ArdiumSnackbarService);

  openSnackbar1() {
    this._snackbarService.open('Hello world!');
  }
  openSnackbar2() {
    const ref = this._snackbarService.open('Hello world!', 'Dismiss');
    ref.onClose.subscribe((withAction) => {
      console.log('Snackbar closed', withAction);
    });
  }
  openSnackbar3(type: ArdSnackbarType) {
    this._snackbarService.open('Hello world!', 'Dismiss', {
      type,
      queueHandling: ArdSnackbarQueueHandling.Overwrite,
    });
  }

  private _ref4?: ArdSnackbarRef;
  openSnackbar4() {
    this._ref4 = this._snackbarService.open('Hello world!', 'Dismiss', {
      duration: Infinity,
      queueHandling: ArdSnackbarQueueHandling.Overwrite,
    });
  }
  closeSnackbar4() {
    this._ref4?.close();
  }

  @ViewChild('originEl')
  private _originEl!: ElementRef<HTMLElement>;
  openSnackbar5() {
    for (const inside of [true, false]) {
      for (const alignment of Object.values(ArdSnackbarAlignment)) {
        this._snackbarService.open('Hello world!', 'Dismiss', {
          queueHandling: ArdSnackbarQueueHandling.Default,
          duration: 1000,
          placement: {
            origin: this._originEl,
            align: alignment,
            originRelation: inside ? ArdSnackbarOriginRelation.Inside : ArdSnackbarOriginRelation.Outside,
          },
        });
      }
    }
  }
}
