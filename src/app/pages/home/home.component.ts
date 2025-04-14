import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('dialog') dialog!: DialogComponent;
  private productService = inject(ProductService);
  displayProducts: Product[] = [];
  products: Product[] = [];
  itemsPerPage = '5';
  displayItemsPerPageOptions = [5, 10, 20];
  activeContextMenu: Product | null = null;
  pageNumber = 1;

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
    const startIndex = (this.pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    this.displayProducts = this.products.slice(startIndex, endIndex);
    if (this.displayProducts.length === 0 && this.pageNumber > 1) {
      this.pageNumber--;
      this.updateDisplayProducts();
    }
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

  confirmDeleteProduct(product: Product): void {
    this.dialog.title = `¿Estás seguro de eliminar el producto ${product.name}?`;
    this.dialog.onConfirmClick = () => {
      this.deleteProduct(product);
      this.dialog.close();
    };
    this.dialog.open();
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe(() => {
      this.closeContextMenu();
      this.products = this.products.filter((p) => p.id !== product.id);
      this.updateDisplayProducts();
    });
  }

  pageLimit() {
    const itemsPerPage = parseInt(this.itemsPerPage);
    const totalPages = Math.ceil(this.products.length / itemsPerPage);
    return totalPages;
  }

  nextPage() {
    const itemsPerPage = parseInt(this.itemsPerPage);
    const totalPages = Math.ceil(this.products.length / itemsPerPage);
    if (this.pageNumber < totalPages) {
      this.pageNumber++;
      this.updateDisplayProducts();
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.updateDisplayProducts();
    }
  }
}
