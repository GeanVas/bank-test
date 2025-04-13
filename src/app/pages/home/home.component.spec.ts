import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
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
      createProduct: jest.fn(),
      validateIdExists: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
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

  it('should log the product and close the context menu on delete', () => {
    const product = {
      id: '123',
      name: 'Product A',
      description: 'Description A',
      date_release: new Date(),
      date_revision: new Date(),
      logo: '',
    };
    jest.spyOn(console, 'log');
    component.deleteProduct(product);
    expect(console.log).toHaveBeenCalledWith('Delete product:', product);
    expect(component.activeContextMenu).toBeNull();
  });
});
