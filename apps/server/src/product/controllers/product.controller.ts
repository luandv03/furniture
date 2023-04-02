import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ProductService } from '../services/product.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Roles(Role.POSTER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
}
