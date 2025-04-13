import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  displayProducts: Product[] = [];
  products: Product[] = [];
  itemsPerPage = '5';
  displayItemsPerPageOptions = [5, 10, 20];
  activeContextMenu: Product | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data.data;
      this.updateDisplayProducts();
    });
  }

  onItemsPerPageChange(event: Event) {
    this.itemsPerPage = (event.target as HTMLSelectElement).value;
    this.updateDisplayProducts();
  }

  updateDisplayProducts() {
    const itemsPerPage = parseInt(this.itemsPerPage);
    this.displayProducts = this.products.slice(0, itemsPerPage);
  }

  filterProducts(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayProducts = this.products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.id.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, parseInt(this.itemsPerPage));
    if (searchTerm === '') {
      this.updateDisplayProducts();
    }
  }

  toggleContextMenu(product: Product): void {
    this.activeContextMenu =
      this.activeContextMenu === product ? null : product;
  }

  closeContextMenu(): void {
    this.activeContextMenu = null;
  }

  editProduct(product: Product): void {
    this.router.navigate([`/form/${product.id}`], {
      state: { product },
    });
    this.closeContextMenu();
  }

  deleteProduct(product: Product): void {
    console.log('Delete product:', product);
    this.closeContextMenu();
  }
}
