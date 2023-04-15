import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { EmailLoginRepository } from '../repositories/email-login.repository';
import { GoogleLoginRepository } from '../repositories/google-login.repository';
import { UserService } from 'src/user/services/user.service';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class AuthService {
  private sercret_key: string;
  private expires_in: string;
  private secret_key_refresh: string | any;
  private expires_in_refresh: string | any;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.sercret_key = this.configService.get('SECRET_KEY') as string;
    this.expires_in = this.configService.get('EXPIRES_IN') as string;
    this.secret_key_refresh = this.configService.get('SECRET_KEY_REFRESH');
    this.expires_in_refresh = this.configService.get('EXPIRES_IN_REFRESH');
  }

  async _createToken(email: string, refresh = true): Promise<any> {
    //refresh : true --> (dùng cho trường hợp đăng nhập, lúc này refesh token sẽ tạo mới)
    if (refresh) {
      const access_token = this.jwtService.sign(
        { email },
        {
          expiresIn: this.expires_in,
          secret: this.sercret_key,
        },
      );
      const refresh_token = this.jwtService.sign(
        { email },
        {
          expiresIn: this.expires_in_refresh,
          secret: this.secret_key_refresh,
        },
      );

      return {
        access_token,
        refresh_token,
        expiresIn: this.expires_in,
        expiresIn_Refresh: this.expires_in_refresh,
      };
    } else {
      // refresh: false (dùng cho trường hợp refesh token (access token hết hạn) thì sẽ cần lấy access token mới)
      const access_token = this.jwtService.sign(
        { email },
        {
          expiresIn: this.expires_in,
          secret: this.sercret_key,
        },
      );
      return {
        access_token,
        expiresIn: this.expires_in,
      };
    }
  }

  async refreshToken(
    refresh_token: string,
    repository: EmailLoginRepository | GoogleLoginRepository,
  ): Promise<any> {
    try {
      // decode token to get email
      const resultTokenDecoded = await this.jwtService.verify(refresh_token, {
        secret: this.secret_key_refresh,
      });

      // get user from email which is decoded from refresh_token
      const user = await this.findUserByDecodedRefreshToken(
        resultTokenDecoded.email,
        refresh_token,
        repository,
      );

      // create new access_token
      const token = await this._createToken(user.email, false);

      return { ...token };
    } catch (e) {
      throw new HttpException(
        'Invalid token::: ' + e.message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // tìm refresh token trong database và giải mã
  async findUserByDecodedRefreshToken(
    email: string,
    refresh_token: string,
    repository: EmailLoginRepository | GoogleLoginRepository,
  ): Promise<IUser> {
    // first: get user from email decoded from refresh_token
    const user = await repository.findByCondition({ email });

    if (!user) {
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }

    const is_equal = await bcrypt.compare(refresh_token, user.refresh_token);

    if (!is_equal) {
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  //update refresh token in email login schema
  async updateRefreshToken(
    filter: any,
    update: any,
    repository: EmailLoginRepository | GoogleLoginRepository,
  ): Promise<any> {
    //1. đối với trường hợp đăng nhập thì refresh_token lúc này được tạo mới
    // chúng ta cần hash refresh_token trước khi lưu vào database
    //2. với trường hợp logout thì refresh_token lúc này là null thì không cần hash
    if (update.refresh_token) {
      update.refresh_token = await bcrypt.hash(update.refresh_token, 10);
    }

    return await repository.findByConditionAndUpdate(filter, update);
  }

  // validate function used in strategy
  async validate(email: string): Promise<IUser> {
    const user = await this.userService.findUserByEmail(
      email,
      '_id email name',
    );
    if (!user) {
      throw new HttpException(
        'Phiên đăng nhập đã hết hạn',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      user_id: user._id,
      name: user.name,
      email: user.email,
    };
  }
}
