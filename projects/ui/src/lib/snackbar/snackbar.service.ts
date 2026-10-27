import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Injector, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isArray, isDefined } from 'simple-bool';
import { Queue } from '../_internal/models/queue';
import { ComponentColor } from '../types/colors.types';
import {
  ARD_SNACKBAR_COLOR,
  ARD_SNACKBAR_DATA,
  ARD_SNACKBAR_TYPE,
  ArdSnackbarRef,
  _ArdSnackbarRefInternal,
} from './snackbar-ref';
import { _ArdSimpleSnackbarComponent } from './snackbar.component';
import { ARD_SNACKBAR_ANIMATION_LENGTH, ARD_SNACKBAR_DEFAULTS } from './snackbar.token';
import { ArdSnackbarOptions, ArdSnackbarOriginRelation, ArdSnackbarQueueHandling, ArdSnackbarType } from './snackbar.types';

const TIMEOUT_LIMIT = 2_147_483_647; //maximum duration for setTimeout in browsers

/**
 * Service for opening snackbars. Provides methods for opening snackbars with either a simple message and action, or with a custom component. Manages a queue of snackbars to be displayed, and handles the display and dismissal of snackbars according to the specified options. Also provides methods for retrieving and clearing the snackbar queue.
 */
@Injectable({
  providedIn: 'root',
})
export class ArdiumSnackbarService implements OnDestroy {
  private readonly _snackbarQueue = new Queue<_ArdSnackbarRefInternal<unknown>>();
  private _openedSnackbar?: _ArdSnackbarRefInternal<unknown>;

  private readonly _DEFAULTS = inject(ARD_SNACKBAR_DEFAULTS);
  private readonly _animationLength = inject(ARD_SNACKBAR_ANIMATION_LENGTH);
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _platformId = inject(PLATFORM_ID);

  //! public methods for creating new snackbars
  /**
   * Opens a snackbar with the given message, action and options.
   * @param message The message to display in the snackbar.
   * @param action The label for the snackbar action. If provided, the snackbar will have an action button with this label.
   *               When the action button is clicked, the snackbar will emit a close event with `withAction` set to `true`.
   * @param options Additional options for configuring the snackbar.
   * @returns A reference to the opened snackbar.
   */
  open(message: string, action?: string, options: ArdSnackbarOptions = {}): ArdSnackbarRef<_ArdSimpleSnackbarComponent> {
    options.data = {
      message,
      action: action ?? options.data?.action,
    };
    const mergedOptions = this._mergeOptions(options);

    if (typeof mergedOptions.data === 'object' && !isArray(mergedOptions.data)) {
      mergedOptions.data.message = message;
      mergedOptions.data.action = action;
    }

    const internalRef = new _ArdSnackbarRefInternal(_ArdSimpleSnackbarComponent, mergedOptions, (withAction?: boolean) => {
      this.dismissCurrent(withAction);
    });

    this._handleQueue(mergedOptions.queueHandling!, internalRef);
    return internalRef.publicRef;
  }
  /**
   * Opens a snackbar with a custom component, passing the given options.
   * @param component The component to display inside the snackbar. This component will be instantiated and inserted into the snackbar overlay.
   * @param options Additional options for configuring the snackbar, such as data to pass to the component, placement, styling, etc.
   * @returns A reference to the opened snackbar, with the generic type of the component instance. You can use this reference to subscribe to open/close events, and to close the snackbar programmatically.
   */
  openFromComponent<T>(component: ComponentType<T>, options: ArdSnackbarOptions): ArdSnackbarRef<T> {
    const mergedOptions = this._mergeOptions(options);

    const internalRef = new _ArdSnackbarRefInternal(component, mergedOptions, (withAction?: boolean) =>
      this.dismissCurrent(withAction)
    );

    this._handleQueue(options.queueHandling!, internalRef);
    return internalRef.publicRef;
  }
  //! handling adding new snackbars to queue
  private _handleQueue<T>(handling: ArdSnackbarQueueHandling, ref: _ArdSnackbarRefInternal<T>) {
    const isNotOpen = !isDefined(this._openedSnackbar);
    if (handling === ArdSnackbarQueueHandling.Default) {
      const wasEmpty = this._snackbarQueue.isEmpty();
      this._snackbarQueue.push(ref);
      if (wasEmpty && isNotOpen) {
        this._openNext();
      }
    } else if (handling === ArdSnackbarQueueHandling.Skip || handling === ArdSnackbarQueueHandling.Overwrite) {
      const wasEmpty = this._snackbarQueue.isEmpty();
      if (!wasEmpty && handling === ArdSnackbarQueueHandling.Overwrite) this._snackbarQueue.clear();
      this._snackbarQueue.pushFront(ref);
      if (wasEmpty && isNotOpen) {
        this._openNext();
      } else {
        this.dismissCurrent(false);
        //it is opened automatically within the dismiss method
      }
    }
  }
  private _mergeOptions(options: ArdSnackbarOptions): Required<ArdSnackbarOptions> {
    // merge placement
    if (options.placement) {
      options.placement = {
        ...this._DEFAULTS.placement,
        ...options.placement,
      };
    } else {
      options.placement = this._DEFAULTS.placement;
    }
    // merge data
    if (options.data) {
      options.data = {
        ...this._DEFAULTS.data,
        ...options.data,
      };
    } else {
      options.data = this._DEFAULTS.data;
    }
    return {
      ...this._DEFAULTS,
      ...options,
    } as Required<ArdSnackbarOptions>;
  }
  //! opening snackbars
  private _openNext() {
    const sb = this._snackbarQueue.pop();
    if (!sb) return;
    this._openedSnackbar = sb;
    const overlay = this._createOverlay(sb.options);
    sb.overlay = overlay;

    const injector = this._createInjector(sb.options, sb.publicRef);
    const portal = new ComponentPortal(sb.component, undefined, injector);
    const componentRef = overlay.attach(portal);
    (sb.publicRef as any).instance = componentRef.instance;
    sb.markAsOpened();

    this._openedSnackbar = sb;

    const duration =
      sb.options.duration === Infinity || sb.options.duration <= 0 || sb.options.duration > TIMEOUT_LIMIT
        ? TIMEOUT_LIMIT
        : sb.options.duration;

    sb.timeout = setTimeout(() => {
      this.dismissCurrent(false);
    }, duration);
  }
  private _createOverlay(options: ArdSnackbarOptions): OverlayRef {
    let x!: 'start' | 'center' | 'end';
    let originY!: 'top' | 'center' | 'bottom';
    let overlayY!: 'top' | 'center' | 'bottom';
    let overlayY2!: 'top' | 'center' | 'bottom';

    //horizontal alignments
    if (options.placement?.align?.match('left')) {
      x = 'start';
    } else if (options.placement?.align?.match('right')) {
      x = 'end';
    } else {
      x = 'center';
    }
    // vertical alignments
    if (options.placement?.align?.match('bottom')) {
      originY = 'bottom';
      overlayY = 'bottom';
      overlayY2 = 'top';
    } else {
      originY = 'top';
      overlayY = 'top';
      overlayY2 = 'bottom';
    }

    let origin = options.placement!.origin;
    if (!origin) {
      if (!isPlatformBrowser(this._platformId)) {
        throw new Error(
          `ARD-FT7021: trying to open a snackbar, but the origin is undefined and the platform is not a browser. Aborting.`
        );
      }
      origin = document.body;
    }

    const isInside = options.placement?.originRelation === ArdSnackbarOriginRelation.Inside;
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        {
          originX: x,
          originY,
          overlayX: x,
          overlayY: isInside ? overlayY : overlayY2,
        },
        {
          originX: x,
          originY,
          overlayX: x,
          overlayY: !isInside ? overlayY : overlayY2,
        },
      ]);

    const config = new OverlayConfig({
      positionStrategy: strategy,
      hasBackdrop: false,
      panelClass: options.panelClass,
    });

    return this._overlay.create(config);
  }

  //! public actions
  /**
   * Dismisses the currently opened snackbar, if any. If `withAction` is true, it indicates that the snackbar is being dismissed as a result of the user clicking the action button (if it has one). This will cause the snackbar to emit a close event with `withAction` set to true, allowing you to differentiate between automatic dismissal and user-initiated dismissal via the action button.
   * @param withAction Optional boolean indicating whether the dismissal is due to the user clicking the action button. Defaults to false. If true, the snackbar's close event will emit with `withAction` set to true, allowing you to handle this case differently if needed.
   */
  dismissCurrent(withAction?: boolean) {
    const sb = this._openedSnackbar;
    if (!sb) {
      console.warn(new Error(`ARD-WA7020: trying to dismiss the current snackbar, but no snackbar is currently opened.`));
      return;
    }

    sb.markAsStartingToClose();

    setTimeout(() => {
      this._openedSnackbar = undefined;
      sb.publicRef.markAsClosed(withAction);
      sb.overlay?.dispose();
      clearTimeout(sb.timeout);

      this._openNext();
    }, this._animationLength);
  }

  //! public queue methods
  /**
   * Returns an array of references to the snackbars currently in the queue, in the order they will be opened. Note that this does not include the currently opened snackbar, if any.
   */
  getQueue(): ArdSnackbarRef<unknown>[] {
    return this._snackbarQueue.toArray().map(v => v.publicRef);
  }
  /**
   * Clears all pending snackbars from the queue. Does not affect the currently opened snackbar, if any. Use with caution, as this will remove all pending snackbars that have not yet been displayed, and they will not be shown at all.
   */
  clearQueue(): void {
    this._snackbarQueue.clear();
  }

  /**
   * @deprecated Internal implementation detail, do not use directly.
   */
  ngOnDestroy(): void {
    this._snackbarQueue.clear();
    this.dismissCurrent(false);
  }

  private _createInjector<T>(options: ArdSnackbarOptions, snackbarRef: ArdSnackbarRef<T>): Injector {
    return Injector.create({
      parent: this._injector,
      providers: [
        { provide: ArdSnackbarRef, useValue: snackbarRef },
        { provide: ARD_SNACKBAR_DATA, useValue: options.data },
        {
          provide: ARD_SNACKBAR_TYPE,
          useValue: options.type ?? ArdSnackbarType.None,
        },
        {
          provide: ARD_SNACKBAR_COLOR,
          useValue: options.color ?? (options.type !== ArdSnackbarType.None ? options.type : null) ?? ComponentColor.Secondary,
        },
      ],
    });
  }
}
