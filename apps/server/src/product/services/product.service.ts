import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Express } from 'express';
import { Types } from 'mongoose';
import { ProductCreateDto } from './../dto/product.dto';
import { ProductRepository } from '../repositories/product.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { IResponse } from '../../common/response.interface';
import { Product } from '../schemas/product.schema';
import { IProductUpdate, IPhoto } from '../interfaces/product.interface';

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

    // tinh toan gia sau khi sale
    productCreateDto.price_sale = productCreateDto.discount
      ? (1 - Number(productCreateDto.discount) / 100) *
        Number(productCreateDto.price)
      : productCreateDto.price;

    return this.productRepository.create(productCreateDto);
  }

  // Paginate all products
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

  //Get product by id
  async getProductById(productId: string): Promise<Product> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new HttpException('Invalid productId', HttpStatus.NOT_ACCEPTABLE);
    }
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  // get product with search
  async getProductWithSearch(query: any): Promise<any> {
    const { title, page, pageSize } = query;

    const countProducts = await this.productRepository.countWithCondition({
      title: {
        $regex: title,
        $options: 'i',
      },
    });

    const products =
      await this.productRepository.getItemWithPaginateAndCondition(
        {
          title: {
            $regex: title,
            $options: 'i',
          },
        },
        Number(page),
        Number(pageSize),
      );

    return {
      products,
      pageSize: Number(pageSize),
      countProduct: countProducts,
      countPage: Math.ceil(countProducts / Number(pageSize)),
    };
  }

  //filter in table as: ?categoryId=...&status=....&page=1&pageSize=10
  async filterProduct(query: any): Promise<any> {
    const { page, pageSize, ...rest } = query;

    const countProducts = await this.productRepository.countWithCondition(rest);

    const products =
      await this.productRepository.getItemWithPaginateAndCondition(
        rest,
        Number(page),
        Number(pageSize),
      );

    return {
      products,
      pageSize: Number(pageSize),
      countProduct: countProducts,
      countPage: Math.ceil(countProducts / Number(pageSize)),
    };
  }

  //update product by Id
  async updateProductById(
    productId: string,
    productUpdate: IProductUpdate,
  ): Promise<IResponse> {
    const product = await this.getProductById(productId);

    await this.productRepository.findByIdAndUpdate(product._id, productUpdate);

    return {
      status: 'Successfully!',
      msg: 'Updated',
    };
  }

  //delete product by id
  async deleteProductById(productId: string): Promise<IResponse> {
    const product = await this.getProductById(productId);

    if (product) {
      product?.product_photo.forEach(
        async (photo: IPhoto) =>
          await this.deleteImageByPublicId(photo?.public_id),
      );
      await this.productRepository.deleteOne(product._id);
    }
    return {
      status: 'Successfully!',
      msg: 'Deleted',
    };
  }

  // Add photo into product
  async addPhotoIntoProduct(
    productId: string,
    files: Array<Express.Multer.File>,
  ): Promise<IResponse> {
    const product = await this.getProductById(productId);
    const images = await this.uploadFiles(files);

    product &&
      (await this.productRepository.findByConditionAndUpdate(
        { _id: productId },
        {
          $push: { product_photo: { $each: images } },
        },
      ));

    return {
      status: 'Successfully!',
      msg: 'Added',
    };
  }

  //Remove photo from product
  async removePhotoFromProduct(
    productId: string,
    public_id: string,
  ): Promise<IResponse> {
    const product = await this.getProductById(productId);

    product &&
      Promise.all([
        await this.deleteImageByPublicId(public_id),
        await this.productRepository.findByIdAndUpdate(productId, {
          $pull: {
            product_photo: { public_id: public_id },
          },
        }),
      ]);

    return {
      status: 'Successfully!',
      msg: 'Removed',
    };
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
