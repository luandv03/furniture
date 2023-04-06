import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Query,
  Get,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ProductService } from '../services/product.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { IResponse } from '../interfaces/response.interface';
import { ProductCreateDto } from '../dto/product.dto';
import { Product } from '../schemas/product.schema';
import { IProductUpdate } from '../interfaces/product.interface';

@Roles(Role.POSTER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/create')
  @UseInterceptors(FilesInterceptor('product_photo'))
  async createProduct(
    @Body() productCreateDto: ProductCreateDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<any> {
    productCreateDto = ProductCreateDto.plainToClass(productCreateDto);
    return this.productService.createProduct(productCreateDto, files);
  }

  @Get('search')
  async getProductWithSearch(@Query() query: any): Promise<any> {
    return this.productService.getProductWithSearch(query);
  }

  @Get('paginate')
  async getProductWithPaginate(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ): Promise<Product[]> {
    return await this.productService.getProductWithPaginate(page, pageSize);
  }

  @Get('filter')
  async filterProduct(@Query() query: any): Promise<any> {
    return await this.productService.filterProduct(query);
  }

  @Patch('update/:productId')
  async updateProduct(
    @Param('productId') productId: string,
    @Body() productUpdate: IProductUpdate,
  ): Promise<IResponse> {
    return this.productService.updateProductById(productId, productUpdate);
  }

  @Delete('delete/:productId')
  async deleteProductById(
    @Param('productId') productId: string,
  ): Promise<IResponse> {
    return this.productService.deleteProductById(productId);
  }

  //Để route này ở dưới, vì nó luôn chạy qua route trước /product/..
  @Get('/:productId')
  async getProductById(
    @Param('productId') productId: string,
  ): Promise<Product> {
    return this.productService.getProductById(productId);
  }

  //Add photo into product
  @Patch('/:productId/add_photo')
  @UseInterceptors(FilesInterceptor('files'))
  async addPhotoIntoProduct(
    @Param('productId') productId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<IResponse> {
    return await this.productService.addPhotoIntoProduct(productId, files);
  }

  //Remove photo from product
  @Patch('/:productId/remove_photo')
  async removePhotoFromProduct(
    @Param('productId') productId: string,
    @Query('public_id') public_id: string,
  ): Promise<IResponse> {
    return await this.productService.removePhotoFromProduct(
      productId,
      public_id,
    );
  }

  @Post('/upload_file')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<any> {
    return this.productService.upload(file);
  }

  @Post('upload_path')
  async uploadPath(@Body() photo: { path: string }): Promise<any> {
    return this.productService.uploadPath(photo);
  }

  @Post('upload_files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return await this.productService.uploadFiles(files);
  }

  @Post('destroy_file')
  async deleteFile(@Body('public_id') public_id: string): Promise<IResponse> {
    return this.productService.deleteImageByPublicId(public_id);
  }
}
