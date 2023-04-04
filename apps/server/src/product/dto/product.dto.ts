import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { Status } from '../enums/product.enum';
import { BaseDto } from 'src/common/base.dto';

export class ProductCreateDto extends BaseDto {
  @IsNotEmpty()
  @Expose()
  title: string;

  @IsNotEmpty()
  @Expose()
  description: string;

  @IsNotEmpty()
  @Expose()
  price: number;

  @IsNotEmpty()
  @Expose()
  discount?: number;

  @IsOptional()
  @Expose()
  price_sale?: number;

  @IsOptional()
  @Expose()
  product_photo: object[];

  @IsNotEmpty()
  @Expose()
  qty: number;

  @IsNotEmpty()
  @Expose()
  categoryId: string;

  @IsOptional()
  @IsEnum(Status, { each: true })
  @Expose()
  status: Status;
}
