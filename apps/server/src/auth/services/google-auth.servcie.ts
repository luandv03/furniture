import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { GoogleLoginRepository } from '../repositories/google-login.repository';
import { IGoogleOAuth2Payload } from '../interfaces/google-oauth2-payload.interface';
import { IUser } from '../interfaces/user.interface';
import { UserService } from 'src/user/services/user.service';
import { AuthService } from './auth.service';
import { IResponse } from 'src/common/response.interface';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly googleLoginRepository: GoogleLoginRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async googleLogin(user: IGoogleOAuth2Payload): Promise<IUser> {
    if (!user) {
      throw new HttpException('Dang nhap that bai', HttpStatus.BAD_REQUEST);
    }

    // check trong db da co user nao co account la email nay chua
    const userExist = await this.userService.findUserByEmail(user.email);

    // truong hop da ton tai email account trong db roi thi khong duoc phep login vao he thong
    if (userExist?.email_verified) {
      throw new HttpException(
        'Email nay da duoc dang nhap voi 1 hinh thuc khac',
        HttpStatus.BAD_REQUEST,
      );
    }

    // truong hop chua ton tai email nay trong db (register + login)
    if (!userExist) {
      return await this.registerWithGoogle(user);
    }

    // truong hop con lai la user nay da dang ky tren he thong voi google auth roi (~ login)
    // can update refresh_token trong google schema
    const googleAccountInfor = await this.loginWithGoogle(user);

    return {
      user_id: userExist._id,
      ...googleAccountInfor,
    };
  }

  async registerWithGoogle(user: IGoogleOAuth2Payload): Promise<IUser> {
    const userCreated = await this.userService.createUser({
      email: user.email,
      name: user.name,
      google_verified: true,
    });

    // tao refresh_token truoc khi luu vao db
    const token = await this.authService._createToken(user.email);
    const hashRefreshToken = await bcrypt.hash(token.refresh_token, 10);
    await this.googleLoginRepository.create({
      user_id: userCreated._id,
      email: user.email,
      name: user.name,
      refresh_token: hashRefreshToken,
    });

    return {
      user_id: userCreated?._id,
      ...user,
      ...token,
    };
  }

  async loginWithGoogle(user: IGoogleOAuth2Payload): Promise<any> {
    const token = await this.authService._createToken(user.email);
    const hashRefreshToken = await bcrypt.hash(token.refresh_token, 10);

    await this.authService.updateRefreshToken(
      { email: user.email },
      hashRefreshToken,
      this.googleLoginRepository,
    );

    return {
      ...token,
    };
  }

  async logoutWithGoogle(email: string): Promise<IResponse> {
    await this.authService.updateRefreshToken(
      { email: email },
      { refresh_token: null },
      this.googleLoginRepository,
    );

    return {
      status: 'successfully!',
      msg: 'Logouted!',
    };
  }

  async refreshTokenWithGoogle(refresh_token: string): Promise<any> {
    return await this.authService.refreshToken(
      refresh_token,
      this.googleLoginRepository,
    );
  }
}
