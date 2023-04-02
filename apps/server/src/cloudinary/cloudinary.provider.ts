import { v2 } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<any> => {
    return v2.config({
      cloud_name: configService.get('CLOUD_NAME'),
      api_key: configService.get('CLOUD_API_KEY'),
      api_secret: configService.get('CLOUD_API_SECRET'),
      secure: true,
    });
  },
  inject: [ConfigService],
};
