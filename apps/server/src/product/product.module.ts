import { RolesGuard } from './guards/roles.guard';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from './schemas/room.schema';
import { CategorySchema } from './schemas/categoty.schema';
import { ProductSchema } from './schemas/product.schema';
import { RoomRepository } from './repositories/room.repository';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';
import { RoomController } from './controllers/room.controller';
import { CategoryController } from './controllers/category.controller';
import { RoomService } from './services/room.service';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: 'Room',
        schema: RoomSchema,
      },
      {
        name: 'Category',
        schema: CategorySchema,
      },
      {
        name: 'Product',
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [RoomController, CategoryController, ProductController],
  providers: [
    ConfigService,
    RoomRepository,
    CategoryRepository,
    ProductRepository,
    RolesGuard,
    RoomService,
    CategoryService,
    ProductService,
    CloudinaryService,
  ],
  exports: [],
})
export class ProductModule {}
