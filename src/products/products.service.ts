import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(url => this.productImagesRepository.create({ url }))
      })
      await this.productRepository.save(product)
      return { ...product, images }
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
    });
  }

  async findOne(term: string) {
    if (isUUID(term)) {
      const product = await this.productRepository.findOneBy({ id: term });
      if (product) return product;
    }
    const product = await this.productRepository.findOneBy({ slug: term });
    if (product) return product;

    throw new NotFoundException(`Producto: ${term} no encontrado`);
  }

  // async update2(id: string, updateProductDto: UpdateProductDto) {

  //   const { images, ...rest } = updateProductDto
  //   const product = await this.productRepository.preload({ id, ...rest })
  //   if (!product) throw new NotFoundException(`Producto: ${id} no encontrado`)

  //   if (images) {
  //     await this.productImagesRepository.remove(product.images ?? [])
  //     product.images = images.map(url => this.productImagesRepository.create({ url }))
  //   }

  //   try {
  //     await this.productRepository.save(product)
  //     return product
  //   } catch (error) {
  //     this.handlerDBException(error)
  //   }
  // }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...rest } = updateProductDto
    const product = await this.productRepository.preload({ id, ...rest })
    if (!product) throw new NotFoundException(`Producto: ${id} no encontrado`)

    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {

      //to delete all images and save the news
      // if (images) {
      //   await queryRunner.manager.delete(ProductImage, { product: { id } })
      //   product.images = images.map(url=> this.productImagesRepository.create({url}))
      // }

      if (images) {
        const newImages = images.map(url =>
          this.productImagesRepository.create({ url, product: { id } })
        );
        await queryRunner.manager.save(ProductImage, newImages);
      }
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()
      return await this.findOne(product.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
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
    throw new InternalServerErrorException('Error en el servidor' + error.message)
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
        .delete()
        .where({})
        .execute()
    } catch (error) {
      this.handlerDBException(error)
    }
  }
}
