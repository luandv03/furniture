import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Express } from 'express';
import { ProductCreateDto } from './../dto/product.dto';
import { ProductRepository } from '../repositories/product.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { IResponse } from '../interfaces/response.interface';
import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Create new product
  async createProduct(
    productCreateDto: ProductCreateDto,
    files: Array<Express.Multer.File>,
  ): Promise<ProductCreateDto> {
    const product_photo = await this.uploadFiles(files);
    productCreateDto.product_photo = product_photo;

    // tinh toan gia sau khi ap giam gia
    productCreateDto.price_sale = productCreateDto.discount
      ? (1 - Number(productCreateDto.discount) / 100) *
        Number(productCreateDto.price)
      : productCreateDto.price;

    return this.productRepository.create(productCreateDto);
  }

  // Paginate products
  async getProductWithPaginate(
    page: number,
    pageSize: number,
  ): Promise<Product[]> {
    const products = await this.productRepository.findAllWithPaginate(
      page,
      pageSize,
    );

    return products;
  }

  /// ### this to end:  is logic upload photo to cloudinary
  async upload(file: Express.Multer.File) {
    return await this.cloudinaryService.uploadImage(file).catch(() => {
      throw new HttpException('Invalid file type.', HttpStatus.BAD_REQUEST);
    });
  }

  async uploadPath(photo: { path: string }): Promise<any> {
    return await this.cloudinaryService
      .uploadWithPath(photo.path)
      .catch((error) => {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      });
  }

  async uploadFiles(arrayFiles: Array<Express.Multer.File>) {
    const image_res = await arrayFiles.map(
      async (file) =>
        await this.cloudinaryService.uploadImage(file).catch(() => {
          throw new HttpException('Invalid file type.', HttpStatus.BAD_REQUEST);
        }),
    );

    const res = await Promise.all(image_res).then((res) => res);
    return res;
  }

  async deleteImageByPublicId(publicId: string): Promise<IResponse> {
    await this.cloudinaryService
      .destroyImage(publicId)
      .then((res) => res)
      .catch((err) => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });

    return {
      status: 'Successfully',
      msg: 'Deleted',
    };
  }
}
