import { Component, effect, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ArdSearchFunction } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';
import { DataService } from './../../services/data.service';

@Component({
  standalone: false,
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
})
export class SelectPage {
  constructor(private _logger: Logger, private _dataService: DataService) {}
  readonly log = this._logger.log;

  //* item lists
  animals = Array.from(this._dataService.animalsArray);
  fruits = Array.from(this._dataService.fruitArray);
  fruitsSmall = Array.from(this._dataService.fruitArray.slice(0, 8));
  colors = Array.from(this._dataService.colorsArray);
  people = Array.from(this._dataService.peopleArray);

  cities = ['Gliwice', 'Katowice', 'Kraków', 'Łódź', 'Warszawa', 'Żory'];

  readonly selectedPeople = signal<string[]>([]);
  readonly selectedCities = signal<string[]>(['Kraków', 'Łódź']);

  readonly isReadOnly = signal<boolean>(true);

  selectedPeopleLogger = effect(() => console.log(this.selectedPeople()));

  //* color search fn
  readonly colorSearchFn = ArdSearchFunction.byLabelAndGroup;

  //* add custom fn
  readonly addCustomFn = (search: string) => {
    return { value: { value: search, custom: true }, label: search };
  };

  isFetchingFromBackend: boolean = false;
  readonly addCustomBackendFn = (search: string) => {
    return new Promise<any>(resolve => {
      this.isFetchingFromBackend = true;

      setTimeout(() => {
        this.isFetchingFromBackend = false;
        resolve(search);
      }, 1000);
    });
  };

  //! editing mode
  editModeEffect = effect(() => {
    this.isEditMode();

    this.form.reset({
      fruit: this.fruits.at(7)!,
    });
  });

  readonly isEditMode = signal<boolean>(false);

  toggleEditMode() {
    this.isEditMode.update(v => !v);
  }

  readonly form = new FormGroup({
    fruit: new FormControl<string>(this.fruits.at(7)!),
  });

  formLogger = this.form.valueChanges.subscribe(value => {
    console.log(this.cities, this.cities.at(2));
    this.log('Select form value:', value);
  });
}

// @Component({
//   selector: 'app-select-display'
// })
