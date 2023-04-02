import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
}
