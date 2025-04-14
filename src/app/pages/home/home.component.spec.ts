import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { Product } from '../../models/product';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    mockProductService = {
      getProducts: jest.fn().mockReturnValue(
        of({
          data: [
            { id: '123', name: 'Product A', description: 'Description A' },
            { id: '456', name: 'Product B', description: 'Description B' },
            { id: '789', name: 'Product C', description: 'Description C' },
          ],
        })
      ),
      deleteProduct: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ProductService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Mock the dialog property
    component.dialog = {
      title: '',
      open: jest.fn(),
      close: jest.fn(),
      onConfirmClick: jest.fn(),
    } as unknown as DialogComponent;

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize products and displayProducts on load', () => {
    expect(component.products.length).toBe(3);
    expect(component.displayProducts.length).toBe(3);
  });

  it('should update displayProducts when itemsPerPage changes', () => {
    component.itemsPerPage = '2';
    component.updateDisplayProducts();
    expect(component.displayProducts.length).toBe(2);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
      { id: '456', name: 'Product B', description: 'Description B' },
    ]);
  });

  it('should filter products based on search term', () => {
    const event = { target: { value: 'Product A' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should reset displayProducts when search term is empty', () => {
    const event = { target: { value: '' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts.length).toBe(3);
  });

  it('should limit filtered products to itemsPerPage', () => {
    component.itemsPerPage = '2';
    const event = { target: { value: 'Product' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts.length).toBe(2);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
      { id: '456', name: 'Product B', description: 'Description B' },
    ]);
  });

  it('should handle case-insensitive search', () => {
    const event = { target: { value: 'product a' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should filter products by ID', () => {
    const event = { target: { value: '123' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should filter products by description', () => {
    const event = { target: { value: 'Description B' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '456', name: 'Product B', description: 'Description B' },
    ]);
  });

  it('should handle empty product list', () => {
    const event = { target: { value: 'Product A' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should reset displayProducts when search term is empty', () => {
    const event = { target: { value: '' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts.length).toBe(3);
  });

  it('should limit filtered products to itemsPerPage', () => {
    component.itemsPerPage = '2';
    const event = { target: { value: 'Product' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts.length).toBe(2);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
      { id: '456', name: 'Product B', description: 'Description B' },
    ]);
  });

  it('should handle case-insensitive search', () => {
    const event = { target: { value: 'product a' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should filter products by ID', () => {
    const event = { target: { value: '123' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '123', name: 'Product A', description: 'Description A' },
    ]);
  });

  it('should filter products by description', () => {
    const event = { target: { value: 'Description B' } } as unknown as Event;
    component.filterProducts(event);
    expect(component.displayProducts).toEqual([
      { id: '456', name: 'Product B', description: 'Description B' },
    ]);
  });

  it('should toggle the context menu for a product', () => {
    const product: Product = {
      id: '123',
      name: 'Product A',
      description: 'Description A',
      date_release: new Date('2025-04-13T07:02:22.130Z'),
      date_revision: new Date('2025-04-13T07:02:22.130Z'),
      logo: '',
    };
    component.toggleContextMenu(product);
    expect(component.activeContextMenu).toBe(product);

    component.toggleContextMenu(product);
    expect(component.activeContextMenu).toBeNull();
  });

  it('should close the context menu', () => {
    component.activeContextMenu = {
      id: '123',
      name: 'Product A',
      description: 'Description A',
      date_release: new Date(),
      date_revision: new Date(),
      logo: '',
    };
    component.closeContextMenu();
    expect(component.activeContextMenu).toBeNull();
  });

  it('should call deleteProduct and update products list on confirmDeleteProduct', () => {
    const product: Product = {
      id: '123',
      name: 'Product A',
      description: 'Description A',
      date_release: new Date(),
      date_revision: new Date(),
      logo: '',
    };

    jest.spyOn(component.dialog, 'open');
    jest.spyOn(component.dialog, 'close');
    jest.spyOn(component, 'deleteProduct');

    component.confirmDeleteProduct(product);

    expect(component.dialog.title).toBe(
      `¿Estás seguro de eliminar el producto ${product.name}?`
    );
    expect(component.dialog.open).toHaveBeenCalled();

    // Simulate confirm action
    component.dialog.onConfirmClick();
    expect(component.deleteProduct).toHaveBeenCalledWith(product);
    expect(component.dialog.close).toHaveBeenCalled();
  });

  it('should delete a product and update the displayProducts list', () => {
    const product: Product = {
      id: '123',
      name: 'Product A',
      description: 'Description A',
      date_release: new Date(),
      date_revision: new Date(),
      logo: '',
    };

    component.deleteProduct(product);

    expect(mockProductService.deleteProduct).toHaveBeenCalledWith(product.id);
    expect(component.products.length).toBe(2);
    expect(component.displayProducts.length).toBe(2);
    expect(component.products.find((p) => p.id === product.id)).toBeUndefined();
  });
});
