import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService
  ) { }

  async runSeed() {
    await this.insertNewProducts()
    return `${initialData.products.length} products have been created`
  }

  private async insertNewProducts() {
    try {
      const products = initialData.products
      await this.productsService.deleteAllProducts()
      products.map(async product => await this.productsService.create(product))
    } catch (error) {
      console.log(error)
      return error.message
    }
  }

}
