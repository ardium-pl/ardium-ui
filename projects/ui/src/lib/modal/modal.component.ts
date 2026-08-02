import { Overlay, OverlayConfig, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { PanelAppearance, PanelVariant } from '../types/theming.types';
import { ARD_MODAL_DEFAULTS } from './modal.defaults';
import { ArdModalCloseIconTemplateDirective } from './modal.directives';

@Component({
  standalone: false,
  selector: 'ard-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumModalComponent {
  private readonly overlay = inject(Overlay);
  private readonly scrollStrategyOpts = inject(ScrollStrategyOptions);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly _DEFAULTS = inject(ARD_MODAL_DEFAULTS);

  //! appearance
  readonly appearance = input<PanelAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<PanelVariant>(this._DEFAULTS.variant);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [`ard-variant-${this.variant()}`, `ard-appearance-${this.appearance()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! heading
  readonly heading = input<string>(this._DEFAULTS.heading);

  readonly noCloseButton = input<boolean, BooleanLike>(this._DEFAULTS.noCloseButton, { transform: v => coerceBooleanProperty(v) });

  readonly panelClass = input<string>(this._DEFAULTS.panelClass);
  readonly backdropClass = input<string>(this._DEFAULTS.backdropClass);

  //! options
  readonly noBackdrop = input<boolean, BooleanLike>(this._DEFAULTS.noBackdrop, { transform: v => coerceBooleanProperty(v) });
  readonly disableBackdropClose = input<boolean, BooleanLike>(this._DEFAULTS.disableBackdropClose, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly allActionsDisabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! open state handling
  private readonly open = signal<boolean>(false);
  @Input({ alias: 'open' })
  set _open(v: any) {
    this.open.set(coerceBooleanProperty(v));
    if (this.open()) this._openOverlay();
    else this._destroyOverlay();
  }

  openProgrammatically() {
    this.open.set(true);
  }
  closeProgrammatically() {
    this.open.set(false);
  }

  readonly openChange = output<boolean>();
  readonly closeEvent = output<void>({ alias: 'close' });

  //! overlay handling
  readonly modalTemplate = viewChild('modalTemplate', { read: TemplateRef });

  private _modalOverlay?: OverlayRef;

  private _openOverlay(): void {
    const strategy = this.overlay.position().global();

    const config = new OverlayConfig({
      positionStrategy: strategy,
      scrollStrategy: this.scrollStrategyOpts.block(),
      hasBackdrop: false,
    });

    this._modalOverlay = this.overlay.create(config);

    const portal = new TemplatePortal(this.modalTemplate()!, this.viewContainerRef);
    this._modalOverlay.attach(portal);
  }
  private _destroyOverlay(): void {
    if (!this._modalOverlay) return;

    this.openChange.emit(false);
    this.closeEvent.emit();
    this._modalOverlay.dispose();
    delete this._modalOverlay;
  }

  //! events
  onBackdropClick(): void {
    if (this.disableBackdropClose() || this.allActionsDisabled()) return;
    this._destroyOverlay();
  }
  onCloseButtonClick(): void {
    if (this.allActionsDisabled()) return;
    this._destroyOverlay();
  }

  //! templates
  readonly closeIconTemplate = contentChild(ArdModalCloseIconTemplateDirective);

  readonly _closeIconTemplate = input<ArdModalCloseIconTemplateDirective | undefined>(undefined);
  readonly closeIconComponent = this._DEFAULTS.CloseIconComponent;
}
