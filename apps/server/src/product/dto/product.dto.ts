import { IsNotEmpty } from 'class-validator';

export class ProductCreateDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  price_sale: number;

  @IsNotEmpty()
  product_photo: string;

  @IsNotEmpty()
  qty: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  status: string;
}
