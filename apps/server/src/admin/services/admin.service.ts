import { TokenResetPassword } from '../schema/token-reset-password.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nest-modules/mailer';
import { AdminRepository } from '../repositories/admin.repository';
import { IAdmin, IToken } from './../interfaces/admin.interface';
import { AdminRegisterDto, AdminLoginDto } from '../dto/admin.dto';
import { TokenResetPasswordRepository } from '../repositories/token-reset-password.repository';
import { jwtConstrant } from '../constrant/jwt.config';
import { urlClient } from '../constrant/token.config';
import { ResetPasswordDto } from '../dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly tokenResetPasswordRepository: TokenResetPasswordRepository,
    private readonly jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(adminRegisterDto: AdminRegisterDto): Promise<IAdmin> {
    const admin = await this.createAccount(adminRegisterDto);
    const token = await this._createToken(admin.email);

    await this.mailerService.sendMail({
      to: admin.email,
      subject: 'Register successfully!',
      context: { name: admin.firstname + ' ' + admin.lastname },
      template: './welcome',
    });

    return {
      _id: admin._id,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      role: admin.role,
      ...token,
    };
  }

  async login(adminLoginDto: AdminLoginDto): Promise<IAdmin> {
    const { email, password } = adminLoginDto;
    const admin = await this.findByEmail(email);
    if (!admin) {
      throw new HttpException('Email not exist!', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new HttpException(
        'Password is not match!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const token = await this._createToken(email);

    return {
      _id: admin._id,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      role: admin.role,
      ...token,
    };
  }

  async logout(admin: IAdmin) {
    await this.update({ email: admin.email }, { refreshToken: null });
  }

  async createAccount(payload: AdminRegisterDto): Promise<any> {
    const { email, password } = payload;
    const user = await this.findByEmail(email, 'email'); //lay ra moi field = "email"
    if (user) {
      throw new HttpException(
        'User already exists!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    payload.password = await bcrypt.hash(password, 10);

    return await this.adminRepository.create(payload);
  }

  private async _createToken(email: string, refresh = true): Promise<any> {
    //refresh : true --> (dùng cho trường hợp đăng nhập, đăng ký , lúc này refesh token sẽ tạo mới)
    if (refresh) {
      const access_token = this.jwtService.sign(
        { email },
        {
          expiresIn: jwtConstrant.EXPIRES_IN,
          secret: jwtConstrant.SECRET_KEY,
        },
      );
      const refresh_token = this.jwtService.sign(
        { email },
        {
          expiresIn: jwtConstrant.EXPIRES_IN_REFRESH,
          secret: jwtConstrant.SECRET_KEY_REFRESH,
        },
      );

      await this.update({ email }, { refresh_token });

      return {
        access_token,
        refresh_token,
        expiresIn: jwtConstrant.EXPIRES_IN,
        expiresIn_Refresh: jwtConstrant.EXPIRES_IN_REFRESH,
      };
    } else {
      // refresh: false (dùng cho trường hợp refesh token (access token hết hạn) thì sẽ cần lấy access token mới)
      const access_token = this.jwtService.sign(
        { email },
        {
          expiresIn: jwtConstrant.EXPIRES_IN,
          secret: jwtConstrant.SECRET_KEY,
        },
      );
      return {
        access_token,
        expiresIn: jwtConstrant.EXPIRES_IN,
      };
    }
  }

  async findByEmail(email: string, filter?: string): Promise<any> {
    return this.adminRepository.findByCondition({ email }, filter);
  }

  //update refresh token
  async update(filter: any, update: any): Promise<any> {
    if (update.refresh_token) {
      update.refresh_token = await bcrypt.hash(update.refresh_token, 10);
    }

    return await this.adminRepository.findByConditionAndUpdate(filter, update);
  }

  async validate(email: string): Promise<IAdmin> {
    const admin = await this.findByEmail(email);

    if (!admin) {
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }

    return admin;
  }

  async refreshToken(refresh_token: string): Promise<IToken> {
    try {
      const payload = await this.jwtService.verify(refresh_token, {
        secret: jwtConstrant.SECRET_KEY_REFRESH,
      });

      const admin = await this.findAdminByDecodedRefreshToken(
        payload.email,
        refresh_token,
      );

      const token = await this._createToken(admin.email, false);

      return {
        ...token,
      };
    } catch (e) {
      throw new HttpException(
        'Invalid token::: ' + e.message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async findAdminByDecodedRefreshToken(
    email: string,
    refresh_token: string,
  ): Promise<IAdmin> {
    const admin = await this.findByEmail(email);

    if (!admin) {
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }

    const is_equal = await bcrypt.compare(refresh_token, admin.refresh_token);

    if (!is_equal) {
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }

    return admin;
  }

  async requestResetPassword(email: string): Promise<{ link: string }> {
    const user = await this.findByEmail(email, '-password -refresh_token');

    if (!user) {
      throw new HttpException('User not exist!', HttpStatus.NOT_FOUND);
    }

    const token = await this.tokenResetPasswordRepository.findByCondition({
      userId: user._id,
    });

    if (token) {
      await this.tokenResetPasswordRepository.deleteOne(token._id);
    }

    const resetToken = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    await this.tokenResetPasswordRepository.create({
      userId: user._id,
      token: hash,
      expires: Date.now() + 30 * 60 * 1000, // 30 phut
    });

    const link = `${urlClient}/password_reset?token=${resetToken}&userId=${user._id}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      context: {
        name: user.firstname + ' ' + user.lastname,
        link: link,
      },
      template: './request',
    });

    return {
      link,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ status: string }> {
    const { userId, password, token } = resetPasswordDto;
    const passwordResetToken: TokenResetPassword =
      await this.tokenResetPasswordRepository.findByCondition({ userId });

    if (!passwordResetToken) {
      throw new HttpException(
        'Invalid or expired password reset token',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const isValid: boolean = await bcrypt.compare(
      token,
      passwordResetToken.token,
    );

    if (!isValid) {
      throw new HttpException(
        'Invalid or expired password reset token',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (passwordResetToken.expires < Date.now()) {
      throw new HttpException('Expired token!', HttpStatus.EXPECTATION_FAILED);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.adminRepository.updateOne(
      { _id: userId },
      { password: passwordHash },
    );

    const user: IAdmin = await this.adminRepository.findByCondition({
      _id: userId,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Change password sucessfully!',
      template: './reset_password_success',
      context: {
        name: user.firstname + ' ' + user.lastname,
      },
    });

    await this.tokenResetPasswordRepository.deleteOne(passwordResetToken._id);

    return {
      status: 'Changed password successfully!',
    };
  }
}
