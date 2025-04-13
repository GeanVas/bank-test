import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { FormComponent } from './form.component';
import { ProductService } from '../../core/services/product.service';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let productServiceMock: any;

  beforeEach(() => {
    productServiceMock = {
      validateIdExists: jest.fn(),
      createProduct: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [FormComponent, ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: productServiceMock }],
    });

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    expect(formValues.date_revision).toBe(component.getNextYear(component.today));
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

  it('should call ProductService.validateIdExists and show an alert if ID exists', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    productServiceMock.validateIdExists.mockReturnValue(of(true));

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });

    component.onSubmit();

    expect(productServiceMock.validateIdExists).toHaveBeenCalledWith('123');
    expect(window.alert).toHaveBeenCalledWith('ID already exists. Please choose a different ID.');
  });

  it('should call ProductService.createProduct and reset the form on successful submission', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    productServiceMock.validateIdExists.mockReturnValue(of(false));
    productServiceMock.createProduct.mockReturnValue(of({}));

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });

    component.onSubmit();

    expect(productServiceMock.validateIdExists).toHaveBeenCalledWith('123');
    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Product created successfully!');
    expect(component.productForm.value.id).toBe('');
  });

  it('should handle errors during product creation', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    productServiceMock.validateIdExists.mockReturnValue(of(false));
    productServiceMock.createProduct.mockReturnValue(throwError(() => new Error('Error')));

    component.productForm.patchValue({
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: component.todayString,
    });

    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith('An error occurred:', expect.any(Error));
  });

  it('should update date_revision when date_release changes', () => {
    const newDate = '2024-01-01';
    component.onDateChange({ target: { value: newDate } } as any);

    expect(component.productForm.getRawValue().date_revision).toBe(component.getNextYear(new Date(newDate)));
  });
});
