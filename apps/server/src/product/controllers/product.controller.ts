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

  @Get()
  async getProductWithPaginate(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ): Promise<Product[]> {
    return await this.productService.getProductWithPaginate(page, pageSize);
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
