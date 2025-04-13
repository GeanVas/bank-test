import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import { Product } from '../../models/product';
import ApiResponse from '../../models/response';
import { provideHttpClient } from '@angular/common/http';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3002/bp';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products', () => {
    const mockResponse: ApiResponse<Product[]> = {
      data: [
        { id: '123', name: 'Product 1', description: 'Description 1', logo: '', date_release: new Date(), date_revision: new Date() },
        { id: '456', name: 'Product 2', description: 'Description 2', logo: '', date_release: new Date(), date_revision: new Date() },
      ],
      message: 'Products fetched successfully',
    };

    service.getProducts().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a product', () => {
    const newProduct: Product = {
      id: '333',
      name: 'Product 3',
      description: 'Description 3',
      logo: '',
      date_release: new Date(),
      date_revision: new Date(),
    };

    const mockResponse: ApiResponse<Product> = {
      data: newProduct,
      message: 'Product created successfully',
    };

    service.createProduct(newProduct).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(mockResponse);
  });

  it('should validate if an ID exists', () => {
    const id = '123';
    const mockResponse = true;

    service.validateIdExists(id).subscribe((exists) => {
      expect(exists).toBe(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/products/verification/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
