import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-checkbox-list',
  templateUrl: './checkbox-list.page.html',
  styleUrls: ['./checkbox-list.page.scss'],
})
export class CheckboxListPage implements OnDestroy {
  readonly fruitItems = ['Apple', 'Banana', 'Pear', 'Starfruit'];

  readonly productItems = [
    { id: 1, name: 'Laptop', isInStock: true },
    { id: 2, name: 'Smartphone', isInStock: false },
    { id: 3, name: 'Tablet', isInStock: true },
    { id: 4, name: 'Smartwatch', isInStock: true },
    { id: 5, name: 'Headphones', isInStock: false },
    { id: 6, name: 'Camera', isInStock: true },
  ];

  readonly selectedProducts = signal<number[]>([]);

  readonly log = inject(Logger).log;

  readonly control = new FormControl<string[]>(['Banana', 'Pear']);

  private readonly _controlSub = this.control.events.subscribe(event => {
    console.log('FormControl Event:', event);
  });

  ngOnDestroy(): void {
    this._controlSub.unsubscribe();
  }

  readonly formModel = signal({
    value1: ['Apple', 'Starfruit'],
  });
  readonly signalForm = form(this.formModel);
}
