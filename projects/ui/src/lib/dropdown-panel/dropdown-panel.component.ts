import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    TemplateRef,
    ViewEncapsulation,
    computed,
    inject,
    input,
    output,
    viewChild,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { Nullable } from '../types/utility.types';
import { ARD_DROPDOWN_PANEL_DEFAULTS } from './dropdown-panel.defaults';
import { DropdownPanelAppearance, DropdownPanelVariant, ScrollAlignment } from './dropdown-panel.types';

@Component({
  standalone: false,
  selector: 'ard-dropdown-panel',
  templateUrl: './dropdown-panel.component.html',
  styleUrls: ['./dropdown-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ard-open]': 'isOpen()',
  },
})
export class ArdiumDropdownPanelComponent implements AfterViewChecked {
  private readonly _DEFAULTS = inject(ARD_DROPDOWN_PANEL_DEFAULTS);

  private readonly _scrollElementRef = viewChild<ElementRef<HTMLElement>>('scroll');
  private readonly _scrollEl = computed(() => this._scrollElementRef()?.nativeElement);

  //! options
  readonly panelId = input<string>();
  readonly headerTemplate = input<TemplateRef<any> | null>(null);
  readonly footerTemplate = input<TemplateRef<any> | null>(null);
  readonly filterValue = input<Nullable<string>>(this._DEFAULTS.filterValue);

  //! appearance
  readonly appearance = input<DropdownPanelAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<DropdownPanelVariant>(this._DEFAULTS.variant);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed((): string =>
    [`ard-appearance-${this.appearance()}`, `ard-variant-${this.variant()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! states
  readonly isOpen = input.required<boolean>();

  //! output events
  readonly scrollEvent = output<{
    start: number;
    end: number;
  }>({ alias: 'scroll' });
  readonly scrollToEndEvent = output({ alias: 'scrollToEnd' });

  //! event handlers
  onScroll() {
    const start = this._scrollTop;
    const end = this._scrollBottom;
    this.scrollEvent.emit({ start, end });

    if (end === this._scrollEl()?.scrollHeight) {
      this.scrollToEndEvent.emit();
    }
  }

  //! hooks
  ngAfterViewChecked(): void {
    if (!this._currentScrollToDirection) return;

    const recent = this._scrollEl()?.querySelector<HTMLElement>('.ard-option-highlighted-recent');
    if (!recent) return;

    const isInView = this._isElementInView(recent);
    if (!isInView) {
      this._scrollToElement(recent, this._currentScrollToDirection);
    }

    this._currentScrollToDirection = null;
  }

  //! scroll position
  private get _scrollTop(): number {
    return this._scrollEl()?.scrollTop ?? 0;
  }
  private set _scrollTop(value: number) {
    const el = this._scrollEl();
    if (!el) return;
    el.scrollTop = value;
  }
  private get _scrollBottom(): number {
    return this._scrollTop + (this._scrollEl()?.getBoundingClientRect().height ?? 0);
  }

  //! scroll to element methods
  private _scrollToElement(el: HTMLElement, alignTo: ScrollAlignment = 'center'): void {
    const scrollEl = this._scrollEl();
    if (!scrollEl) return;

    const parentContentRect = this._getContentRect(scrollEl);
    const elementRect = el.getBoundingClientRect();

    switch (alignTo) {
      case 'top':
        this._scrollTop += elementRect.top - parentContentRect.top;
        break;
      case 'bottom':
        this._scrollTop += elementRect.bottom - parentContentRect.bottom;
        break;
      case 'center':
        this._scrollTop += (elementRect.top + elementRect.bottom) / 2 - parentContentRect.top - parentContentRect.height / 2;
        break;
    }
  }

  private _currentScrollToDirection: ScrollAlignment | null = null;
  scrollToRecentlyHighlighted(direction: ScrollAlignment): void {
    this._currentScrollToDirection = direction;
  }
  private _isElementInView(el: HTMLElement): boolean {
    const scrollEl = this._scrollEl();
    if (!scrollEl) return true;

    const parentContentRect = this._getContentRect(scrollEl);
    const elementRect = el.getBoundingClientRect();
    return elementRect.bottom < parentContentRect.bottom && elementRect.top > parentContentRect.top;
  }
  private _getContentRect(el: HTMLElement): DOMRect {
    const elRect = el.getBoundingClientRect();
    const elPadding = window.getComputedStyle(el).getPropertyValue('padding');
    const paddings = elPadding.split(' ').map(v => (v ? parseFloat(v) : null));
    const topPadd = paddings[0] ?? 0;
    const rightPadd = paddings[1] ?? topPadd;
    const bottomPadd = paddings[2] ?? topPadd;
    const leftPadd = paddings[3] ?? rightPadd ?? topPadd;

    return new DOMRect(
      elRect.x + leftPadd,
      elRect.y + topPadd,
      elRect.width - leftPadd - rightPadd,
      elRect.height - topPadd - bottomPadd
    );
  }
}
