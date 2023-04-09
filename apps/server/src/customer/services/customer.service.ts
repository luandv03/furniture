//packages
import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { MailerService } from '@nest-modules/mailer';

// entities
import { UserRepository } from '../repositories/user.repository';
import { EmailLoginRepository } from './../repositories/email-login.repository';
import { TokenVerifyEmailRepository } from './../repositories/token-verify-email.repository';
import { User } from '../schema/user.schema';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { IResponse } from 'src/common/response.interface';

@Injectable()
export class CustomerService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailLoginRepository: EmailLoginRepository,
    private readonly tokenVerifyEmailRepository: TokenVerifyEmailRepository,
    private readonly mailerService: MailerService,
  ) {}

  async registerAccountWithEmail(
    userCreateDto: UserCreateDto,
  ): Promise<IResponse> {
    const userCheckExist: User | any = await this.findUserByEmail(
      userCreateDto.email,
    );

    // check user exist in google | email account ?
    await this.checkUserExist(userCheckExist);

    // kiểm tra mã OTP có hợp lệ hay không
    await this.checkCodeAuthFromEmail(userCreateDto.token);

    // sau khi validate đã ok thì tạo mới user trong db
    const user = await this.userRepository.create(userCreateDto);
    await this.userRepository.findByIdAndUpdate(user._id, {
      email_verified: true,
    });

    // sau khi tạo xong thì xóa token OTP trong db đi
    await this.tokenVerifyEmailRepository.deleteByCondition({
      token: userCreateDto.token,
    });

    // tiến hành tạo user trong EmailLogin db để validate khi login với email account
    userCreateDto.password = await bcrypt.hash(userCreateDto.password, 10); // hash password before save to db
    await this.emailLoginRepository.create({
      userId: user._id,
      email: user.email,
      password: userCreateDto.password,
    });

    return {
      status: 'Successfully!',
      msg: 'Chúc mừng bạn đã đăng ký thành công!',
    };
  }

  // gửi OTP xác nhận email
  async sendCodeAuthToEmail(email: string): Promise<IResponse> {
    const codeAuth = await randomInt(0, 999999).toString().padStart(6, '0'); //tạo ra 6 số ngẫu nhiên
    await this.tokenVerifyEmailRepository.create({
      token: codeAuth,
      expires: Date.now() + 5 * 60 * 1000, // 2 minutes
    });

    // gửi mã xác thực đến địa chỉ email người tạo tài khoản để xác nhận
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác nhận email đăng ký tài khoản',
      context: {
        codeAuth,
      },
      template: './verify_account_email',
    });

    return {
      status: 'Successfully',
      msg: 'Đã gửi mã xác thực',
    };
  }

  // Kiểm tra OTP có hợp lệ hay không
  async checkCodeAuthFromEmail(token: string): Promise<void> {
    const codeAuth = await this.tokenVerifyEmailRepository.findByCondition({
      token,
    });
    if (!codeAuth) {
      throw new HttpException(
        'Mã xác thực không chính xác',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check OTP đã hết hạn hay chưa?
    if (Date.now() > codeAuth.expires) {
      // hết hạn rồi thì xóa khỏi database luôn cho đỡ tốn db
      await this.tokenVerifyEmailRepository.deleteByCondition({
        token,
      });

      throw new HttpException(
        'Mã OTP đã hết hạn, vui lòng lấy mã OTP mới',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

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

  async findUserByEmail(email: string): Promise<User | any> {
    const user = await this.userRepository.findByCondition({ email });

    return user;
  }
}
