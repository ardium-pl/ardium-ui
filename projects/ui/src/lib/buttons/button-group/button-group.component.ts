import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    SimpleChanges,
    ViewEncapsulation,
    computed,
    contentChildren,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { ArdiumButtonComponent, ArdiumButtonDirective } from '../button';
import { ARD_BUTTON_GROUP_DEFAULTS } from './button-group.defaults';

@Component({
  standalone: false,
  selector: 'ard-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ard-button-group',
    '[class.ard-button-group__vertical]': 'verticalOrInherited()',
    '[class.ard-button-group__compact]': 'compactOrInherited()',
  },
})
export class ArdiumButtonGroupComponent implements AfterContentInit {
  private readonly _DEFAULTS = inject(ARD_BUTTON_GROUP_DEFAULTS);

  readonly vertical = input<boolean, BooleanLike>(this._DEFAULTS.vertical, { transform: v => coerceBooleanProperty(v) });
  readonly inheritedVertical = signal<boolean | null>(null);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });
  readonly inheritedCompact = signal<boolean | null>(null);

  readonly wasVerticalChanged = signal<boolean>(false);
  readonly wasCompactChanged = signal<boolean>(false);

  readonly verticalOrInherited = computed(() =>
    this.wasVerticalChanged() ? this.vertical() : (this.inheritedVertical() ?? this.vertical())
  );
  readonly compactOrInherited = computed(() =>
    this.wasCompactChanged() ? this.compact() : (this.inheritedCompact() ?? this.compact())
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vertical']) {
      this.wasVerticalChanged.set(true);
    }
    if (changes['compact']) {
      this.wasCompactChanged.set(true);
    }
  }

  readonly groupChildren = contentChildren(ArdiumButtonGroupComponent);
  readonly buttonChildren = contentChildren(ArdiumButtonComponent);
  readonly buttonDirChildren = contentChildren(ArdiumButtonDirective);

  constructor() {
    effect(() => {
      this._updateChildrenStyles();
    });
  }

  private _wasContentInitialized = false;
  ngAfterContentInit() {
    this._wasContentInitialized = true;
    this._updateChildrenStyles();
  }

  private _updateChildrenStyles() {
    const buttonChildren = this.buttonChildren();
    const buttonDirChildren = this.buttonDirChildren();
    const groupChildren = this.groupChildren();

    const compact = this.compactOrInherited();
    const vertical = this.verticalOrInherited();

    if (!this._wasContentInitialized) {
      return;
    }

    for (const child of [...buttonChildren, ...buttonDirChildren]) {
      child.inheritedCompact.set(compact);
    }
    for (const child of groupChildren) {
      child.inheritedCompact.set(compact);
      child.inheritedVertical.set(vertical);
    }
  }
}
