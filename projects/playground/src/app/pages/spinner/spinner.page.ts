import { Component } from '@angular/core';
import { SimpleComponentColor as SCC } from '../../../../../ui/src/public-api';

@Component({
  standalone: false,
  selector: 'app-spinner',
  templateUrl: './spinner.page.html',
  styleUrls: ['./spinner.page.scss'],
})
export class SpinnerPage {
  readonly colors = Object.values(SCC);
}
