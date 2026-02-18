import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product)
      return product
    } catch (error) {
      this.handlerDBException(error)
    }
  }

  //TODO: paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto

    return await this.productRepository.find({
      take: limit || 10,
      skip: offset || 0
      //TODO: Relations
    });
  }

  async findOne(term: string) {
    if (isUUID(term)) {
      const product = await this.productRepository.findOneBy({ id: term });
      if (product) return product;
    }
    const product = await this.productRepository.findOneBy({ slug: term });
    product && console.log(new Date(product.createdAt).toLocaleString())
    if (product) return product;
    
    throw new NotFoundException(`Producto: ${term} no encontrado`);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id)
      Object.assign(product, updateProductDto)
      await this.productRepository.save(product)
      return product;
    } catch (error) {
      this.handlerDBException(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
    return `Se eliminó: ${product.name}`;
  }

  private handlerDBException(error: any) {
    // unique constraint
    if (error.code === '23505') {
      throw new BadRequestException('Ya existe un registro con ese nombre');
    }
    // NOT NULL constraint
    if (error.code === '23502') {
      throw new BadRequestException(error.message);
    }
    throw new InternalServerErrorException('Error al crear el producto (service)' + error.message)
  }

}
