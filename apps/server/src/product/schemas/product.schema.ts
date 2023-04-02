import mongoose from 'mongoose';
import { Status } from '../enums/product.enum';
import { Category } from './categoty.schema';

export const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    description: { type: String }, // kích thước, chất liệu,...
    price: { type: Number }, // giá sản phẩm hiện tại
    discount: { type: Number }, // % giam gia
    price_sale: { type: Number }, // giá sau khi giảm giá
    product_photo: [{ type: Object }],
    qty: { type: Number }, // số lượng phẩm hiện có trong kho
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    status: { type: String, enum: Status, default: Status.ACTIVE }, // active || unactive
  },
  {
    timestamps: true,
    collection: 'product',
  },
);

export class Product extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  discount: number;
  price_sale: number;
  product_photo: object[];
  qty: number;
  categoryId: Category;
  status: string;
}
