import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { ICloudinaryImage } from './cloudinary.interface';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse | ICloudinaryImage> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: this.configService.get('CLOUD_FOLDER') },
        (error, result: any) => {
          if (error) return reject(error);
          resolve({
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url,
          });
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadWithPath(path: string) {
    return await v2.uploader.upload(path, {
      folder: this.configService.get('CLOUD_FOLDER'),
    });
  }

  async reSizeImage(id: string, h: number, w: number): Promise<any> {
    return await v2.url(id, {
      height: h,
      width: w,
      crop: 'scale',
      format: 'jpg',
    });
  }

  async destroyImage(public_id: string): Promise<any> {
    const destroy = await v2.uploader.destroy(public_id);

    return destroy;
  }
}
