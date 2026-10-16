import { Component, inject } from '@angular/core';
import { ArdiumBreakpointService } from '../../../../../ui/src/public-api';

@Component({
  standalone: false,
  selector: 'app-grid',
  templateUrl: './grid.page.html',
  styleUrl: './grid.page.scss',
})
export class GridPage {
  readonly breakpointService = inject(ArdiumBreakpointService);
}
