import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../../models/product';
import ApiResponse from '../../models/response';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3002/bp';

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`);
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, product);
  }

  validateIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/products/verification/${id}`);
  }
}
