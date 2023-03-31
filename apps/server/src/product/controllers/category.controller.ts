import { CategoryCreateDto } from './../dto/category.dto';
import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from 'src/admin/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CategoryService } from '../services/category.service';
import { IResponse } from '../interfaces/response.interface';
import { Category } from '../schemas/categoty.schema';
import { ICategoryUpdate } from '../interfaces/category.interface';

@Roles(Role.POSTER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/create')
  async createCategory(
    @Body()
    categoryCreateDto: CategoryCreateDto,
  ): Promise<IResponse> {
    return this.categoryService.createCategory(categoryCreateDto);
  }

  @Get('/all')
  async getCategory(): Promise<Category[]> {
    return await this.categoryService.getAllCategories();
  }

  @Get('/:id')
  async getCategoryById(@Param('id') categoryId: string): Promise<Category> {
    return this.categoryService.getCategoryById(categoryId);
  }

  @Patch('/update/:id')
  async updateCategoryById(
    @Param('id') categoryId: string,
    @Body() categoryUpdate: ICategoryUpdate,
  ): Promise<IResponse> {
    return this.categoryService.updateCategoryById(categoryId, categoryUpdate);
  }

  @Delete('/delete/:id')
  async deleteCategoryById(
    @Param('id') categoryId: string,
  ): Promise<IResponse> {
    return this.categoryService.deleteCategoryById(categoryId);
  }
}
