import { Expose, plainToInstance } from 'class-transformer';

export abstract class BaseDto {
  @Expose()
  _id: string;

  @Expose()
  creadtedAt: Date;

  @Expose()
  updatedAt: Date;

  // chuyển đổi dữ liệu đầu vào, tránh tình trạng user truyền thừa các field khác => làm đầy database
  static plainToClass<T>(this: new (...args: any[]) => T, obj: T) {
    return plainToInstance(this, obj, { excludeExtraneousValues: true });
  }
}
