import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { FormComponent } from './form.component';
import { ProductService } from '../../core/services/product.service';
import { DialogComponent } from '../../shared/dialog/dialog.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let productServiceMock: any;

  beforeEach(() => {
    productServiceMock = {
      validateIdExists: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [FormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
      ],
    }).compileComponents();

    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        state: {
          product: null,
        },
      },
    });

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    component.dialog = {
      title: '',
      message: '',
      open: jest.fn(),
      close: jest.fn(),
      onConfirmClick: jest.fn(),
      showCancel: false,
    } as unknown as DialogComponent;
    
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    const formValues = component.productForm.getRawValue();
    expect(formValues.id).toBe('');
    expect(formValues.name).toBe('');
    expect(formValues.description).toBe('');
    expect(formValues.logo).toBe('');
    expect(formValues.date_release).toBe(component.todayString);
    expect(formValues.date_revision).toBe(
      component.getNextYear(component.today)
    );
  });

  it('should mark the form as invalid if required fields are missing', () => {
    component.productForm.patchValue({
      id: '',
      name: '',
      description: '',
      logo: '',
    });
    expect(component.productForm.valid).toBeFalsy();
  });

  it('should call ProductService.validateIdExists and show a dialog if ID exists', () => {
    productServiceMock.validateIdExists.mockReturnValue(of(true));

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });
    jest.spyOn(component.dialog, 'open');

    component.onSubmit();

    expect(productServiceMock.validateIdExists).toHaveBeenCalledWith('123');
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialogTitle).toBe('Error');
    expect(component.dialogMessage).toBe(
      'ID already exists. Please choose a different ID.'
    );
  });

  it('should call ProductService.createProduct and show a success dialog on successful submission', () => {
    productServiceMock.validateIdExists.mockReturnValue(of(false));
    productServiceMock.createProduct.mockReturnValue(of({}));

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });
    jest.spyOn(component.dialog, 'open');
    jest.spyOn(component.dialog, 'close');

    component.onSubmit();

    expect(productServiceMock.validateIdExists).toHaveBeenCalledWith('123');
    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialogTitle).toBe('Success');
    expect(component.dialogMessage).toBe('Product created successfully!');
  });

  it('should handle errors during product creation and show an error dialog', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    productServiceMock.validateIdExists.mockReturnValue(of(false));
    productServiceMock.createProduct.mockReturnValue(
      throwError(() => new Error('Error'))
    );

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });
    jest.spyOn(component.dialog, 'open');
    jest.spyOn(component.dialog, 'close');

    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith(
      'An error occurred:',
      expect.any(Error)
    );
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialogTitle).toBe('Error');
    expect(component.dialogMessage).toBe(
      'An error occurred while creating the product.'
    );
  });

  it('should update date_revision when date_release changes', () => {
    const newDate = '2024-01-01';
    component.onDateChange({ target: { value: newDate } } as any);

    expect(component.productForm.getRawValue().date_revision).toBe(
      component.getNextYear(new Date(newDate))
    );
  });

  it('should reset the form to default values on reset', () => {
    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: '2024-01-01',
    });

    component.onReset();

    const formValues = component.productForm.getRawValue();
    expect(formValues.id).toBe('');
    expect(formValues.name).toBe('');
    expect(formValues.description).toBe('');
    expect(formValues.logo).toBe('');
    expect(formValues.date_release).toBe(component.todayString);
    expect(formValues.date_revision).toBe(
      component.getNextYear(component.today)
    );
  });

  it('should call ProductService.updateProduct and show a success dialog on successful update', () => {
    productServiceMock.updateProduct.mockReturnValue(of({}));

    component.product = {
      id: '123',
      name: 'Existing Product',
      description: 'Existing Description',
      logo: 'http://example.com/logo.png',
      date_release: new Date('2024-01-01'),
      date_revision: new Date('2025-01-01'),
    };

    component.productForm.patchValue({
      id: '123',
      name: 'Updated Product',
      description: 'Updated Description',
      logo: 'http://example.com/logo-updated.png',
      date_release: '2024-01-01',
    });
    jest.spyOn(component.dialog, 'open');
    jest.spyOn(component.dialog, 'close');

    component.onSubmit();

    expect(productServiceMock.updateProduct).toHaveBeenCalled();
    expect(component.dialog.open).toHaveBeenCalled();
    expect(component.dialogTitle).toBe('Success');
    expect(component.dialogMessage).toBe('Product updated successfully!');
  });

  it('should pre-fill the form with product data from history.state and disable the id field', () => {
    // Mock a product in history.state
    const mockProduct = {
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01',
    };
    window.history.state.product = mockProduct;

    // Reinitialize the component to pick up the mocked product
    component.ngOnInit();

    // Verify the form is pre-filled with the product data
    const formValues = component.productForm.getRawValue();
    expect(formValues.id).toBe(mockProduct.id);
    expect(formValues.name).toBe(mockProduct.name);
    expect(formValues.description).toBe(mockProduct.description);
    expect(formValues.logo).toBe(mockProduct.logo);
    expect(formValues.date_release).toBe(mockProduct.date_release);
    expect(formValues.date_revision).toBe(mockProduct.date_revision);

    // Verify the id field is disabled
    expect(component.productForm.get('id')?.disabled).toBeTruthy();
  });
});
