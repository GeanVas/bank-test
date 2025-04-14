import { Component, OnInit, inject, ViewChild } from '@angular/core';
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
import { Router } from '@angular/router';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @ViewChild('dialog') dialog!: DialogComponent;

  private productService = inject(ProductService);
  today: Date = new Date();
  todayString: string = this.today.toISOString().split('T')[0];
  productForm!: FormGroup;
  product: Product | null = null;

  dialogMessage = '';
  dialogTitle = '';
  onDialogConfirm: (() => void) | null = null;

  constructor(private fb: FormBuilder, private router: Router) {}

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

    this.product = history.state.product;
    if (this.product) {
      this.productForm.patchValue({
        id: this.product.id,
        name: this.product.name,
        description: this.product.description,
        logo: this.product.logo,
        date_release: new Date(this.product.date_release).toISOString().split('T')[0],
        date_revision: new Date(this.product.date_revision).toISOString().split('T')[0],
      });
      this.productForm.get('id')?.disable();
    }
  }

  getNextYear(date: Date): string {
    const nextYear = new Date(date);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.productForm.valid) return;

    const product: Product = this.productForm.getRawValue();
    product.date_revision = new Date(
      this.getNextYear(new Date(product.date_release))
    );

    if (!this.product) {
      this.createProduct(product);
      return;
    }
    this.updateProduct(product);
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

  private navigateToHome() {
    this.router.navigate(['/']);
  }

  private createProduct(product: Product) {
    this.productService
      .validateIdExists(product.id)
      .pipe(
        switchMap((exists) => {
          if (exists) {
            this.showDialog(
              'Error',
              'ID already exists. Please choose a different ID.',
              null
            );
            return of(null);
          }
          return this.productService.createProduct(product).pipe(
            tap(() => {
              this.showDialog('Success', 'Product created successfully!', () => {
                this.onReset();
                this.navigateToHome();
              });
            })
          );
        }),
        catchError((error) => {
          console.error('An error occurred:', error);
          this.showDialog('Error', 'An error occurred while creating the product.', null);
          return of(null);
        })
      )
      .subscribe();
  }

  private updateProduct(product: Product) {
    this.productService
      .updateProduct(product)
      .pipe(
        tap(() => {
          this.showDialog('Success', 'Product updated successfully!', () => {
            this.onReset();
            this.navigateToHome();
          });
        }),
        catchError((error) => {
          console.error('An error occurred:', error);
          this.showDialog('Error', 'An error occurred while updating the product.', null);
          return of(null);
        })
      )
      .subscribe();
  }

  private showDialog(title: string, message: string, onConfirm: (() => void) | null) {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.onDialogConfirm = onConfirm;
    this.dialog.showCancel = onConfirm !== null;
    this.dialog.open();
  }

  onDialogConfirmClick() {
    if (this.onDialogConfirm) {
      this.onDialogConfirm();
    }
  }
}
