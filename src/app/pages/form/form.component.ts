import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { switchMap, of, tap, catchError } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { urlValidator } from '../../core/validators/url.validator';
import { Product } from '../../models/product';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  private productService = inject(ProductService);
  today: Date = new Date();
  todayString: string = this.today.toISOString().split('T')[0];
  productForm!: FormGroup; // Use definite assignment assertion (!)

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', [Validators.required, urlValidator()]],
      date_release: [this.todayString, [Validators.required]],
      date_revision: [
        { value: this.getNextYear(this.today), disabled: true },
        Validators.required,
      ],
    });
  }

  getNextYear(date: Date): string {
    const nextYear = new Date(date);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.productForm.valid) {
      const product: Product = this.productForm.getRawValue();
      product.date_revision = new Date(this.getNextYear(
        new Date(product.date_release)
      ));

      this.productService
        .validateIdExists(product.id)
        .pipe(
          switchMap((exists) => {
            if (exists) {
              alert('ID already exists. Please choose a different ID.');
              return of(null);
            }
            return this.productService.createProduct(product).pipe(
              tap(() => {
                alert('Product created successfully!');
                this.onReset();
              })
            );
          }),
          catchError((error) => {
            console.error('An error occurred:', error);
            return of(null);
          })
        )
        .subscribe();
    } else {
      console.log('Form is invalid');
    }
  }

  onReset() {
    this.productForm.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: this.todayString,
      date_revision: this.getNextYear(this.today),
    });
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    this.productForm.patchValue({
      date_revision: this.getNextYear(selectedDate),
    });
  }
}
