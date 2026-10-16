import { Directive, ElementRef, Inject, Input, Renderer2, OnInit, OnChanges, OnDestroy, DOCUMENT } from '@angular/core';

import { RoundedSelectionData } from '../types';
import { getRoundedSelectionHTMLData } from '../html';

@Directive({
  selector: '[ardRoundedSelection]',
})
export class ArdiumRoundedSelectionDirective implements OnInit, OnChanges, OnDestroy {
  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @Input('ardRoundedSelection') roundedSelectionData: RoundedSelectionData = [];
  @Input('ardRoundedSelectionLineClass') lineClass?: string = '';
  @Input('ardRoundedSelectionCellClass') cellClass?: string = '';

  ngOnInit(): void {
    this.elementRef.nativeElement.classList.add('ard-rounded-selection-container');
  }
  ngOnDestroy(): void {
    this.elementRef.nativeElement.classList.remove('ard-rounded-selection-container');
    this._removeAllChildren();
  }

  private _removeAllChildren(): void {
    const el = this.elementRef.nativeElement;
    //checking for first child *may* be faster in some cases
    while (el.firstChild) {
      //removing the last child is usually faster than the first child
      this.renderer.removeChild(el, el.lastChild);
    }
  }

  ngOnChanges(): void {
    this._removeAllChildren();

    for (const lineData of this.roundedSelectionData) {
      //create line element
      const line = this.document.createElement('div');
      //add classes
      line.classList.add('ard-rounded-selection-line');
      if (this.lineClass) line.classList.add(this.lineClass);
      //create cells
      for (const cellData of lineData) {
        //create cell element
        const cell = this.document.createElement('div');
        //add appropriate classes
        cell.classList.add(getRoundedSelectionHTMLData(cellData).classes);
        if (this.cellClass) cell.classList.add(this.cellClass);
        //set the css variable for handling span
        cell.style.setProperty('--ard-_rounded-selection-span', String(cellData.span));
        //append into the line
        this.renderer.appendChild(line, cell);
      }
      //append into the main element
      this.renderer.appendChild(this.elementRef.nativeElement, line);
    }
  }
}
