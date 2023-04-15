import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async checkUserExist(user: User): Promise<void> {
    if (user) {
      if (user.google_verified) {
        throw new HttpException(
          'Email này đã được sử dụng để đăng nhập với hình thức Google',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      throw new HttpException(
        'Email này đã tồn tại!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async findUserByEmail(email: string, option?: any): Promise<User | any> {
    const user = await this.userRepository.findByCondition({ email }, option);
    return user;
  }

  async createUser(user: any): Promise<User> {
    return await this.userRepository.create(user);
  }

  async findUserByIdAndUpdate(id: string, update: any): Promise<void> {
    await this.userRepository.findByIdAndUpdate(id, update);
  }
}
