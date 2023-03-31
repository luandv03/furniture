import { Category } from './../schemas/categoty.schema';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryCreateDto } from '../dto/category.dto';
import { IResponse } from '../interfaces/response.interface';
import { ICategoryUpdate } from '../interfaces/category.interface';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    categoryCreateDto: CategoryCreateDto,
  ): Promise<IResponse> {
    const category = await this.categoryRepository.findByCondition({
      title: {
        $regex: categoryCreateDto.title,
        $options: 'i',
      },
    });

    if (category) {
      throw new HttpException(
        'Category already exists',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    await this.categoryRepository.create(categoryCreateDto);

    return {
      status: 'Successfully',
      msg: 'Created',
    };
  }

  async getAllCategories(): Promise<Category[]> {
    const categories = await this.categoryRepository.findAll();

    await this.categoryRepository.populate(categories, [
      { path: 'roomId', select: 'title' },
    ]);
    return categories;
  }

  async findCategoryById(categoryId: string): Promise<Category> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new HttpException('Invalid categoryId', HttpStatus.NOT_ACCEPTABLE);
    }

    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new HttpException('Category not exist!', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    const category = await this.findCategoryById(categoryId);
    await category.populate('roomId', 'title');

    return category;
  }

  async updateCategoryById(
    categoryId: string,
    categoryUpdate: ICategoryUpdate,
  ): Promise<IResponse> {
    const category = await this.findCategoryById(categoryId);

    category &&
      (await this.categoryRepository.updateOne(
        { _id: categoryId },
        categoryUpdate,
      ));

    return {
      status: 'Successfully!',
      msg: 'Updated',
    };
  }

  async deleteCategoryById(categoryId: string): Promise<IResponse> {
    const category = await this.findCategoryById(categoryId);

    //Đoạn này sẽ check xem liệu category này có đang chứa product nào không
    // Nếu không thì mới được xóa

    category && (await this.categoryRepository.deleteOne(categoryId));

    return {
      status: 'Successfully!',
      msg: 'Deleted',
    };
  }
}
