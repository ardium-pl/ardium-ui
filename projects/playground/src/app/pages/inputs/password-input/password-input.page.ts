import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';

@Component({
  standalone: false,
  selector: 'app-password-input',
  templateUrl: './password-input.page.html',
  styleUrls: ['./password-input.page.scss'],
})
export class PasswordInputPage {
  readonly control = new FormControl('foobar');

  readonly formValue = signal({
    input1: 'abcdef',
  });
  readonly form = form(this.formValue);
}
