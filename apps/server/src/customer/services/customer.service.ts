//packages
import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { MailerService } from '@nest-modules/mailer';
import { JwtService } from '@nestjs/jwt';

// entities
import { UserRepository } from '../repositories/user.repository';
import { EmailLoginRepository } from './../repositories/email-login.repository';
import { TokenVerifyEmailRepository } from './../repositories/token-verify-email.repository';
import { User } from '../schema/user.schema';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { IResponse } from 'src/common/response.interface';
import { EmailLoginDto } from '../dto/userCreateDto.dto';
import { jwtConstrant } from 'src/admin/constrant/jwt.config';

@Injectable()
export class CustomerService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailLoginRepository: EmailLoginRepository,
    private readonly tokenVerifyEmailRepository: TokenVerifyEmailRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithEmail(emailLoginDto: EmailLoginDto): Promise<any> {
    const { email, password } = emailLoginDto;
    const user = await this.emailLoginRepository.findByCondition(
      {
        email,
      },
      null,
      null,
      { path: 'user_id', select: 'name' },
    );

    if (!user) {
      throw new HttpException(
        'Email không tồn tại!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const token = await this._createToken(email);

    return {
      user_id: user.user_id._id,
      name: user.user_id.name,
      email: user.email,
      ...token,
    };
  }

  async _createToken(email: string, refresh = true): Promise<any> {
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

  //update refresh token in email login schema
  async update(filter: any, update: any): Promise<any> {
    if (update.refresh_token) {
      update.refresh_token = await bcrypt.hash(update.refresh_token, 10);
    }

    return await this.emailLoginRepository.findByConditionAndUpdate(
      filter,
      update,
    );
  }

  async registerAccountWithEmail(
    userCreateDto: UserCreateDto,
  ): Promise<IResponse> {
    const userCheckExist: User | any = await this.findUserByEmail(
      userCreateDto.email,
    );

    // check user exist in google | email account ?
    await this.checkUserExist(userCheckExist);

    // kiểm tra mã OTP có hợp lệ hay không
    // Và check xem email của người gửi đăng kí có trùng với email người nhận OTP hay không
    // để tránh trường hợp dùng email ảo đkí bằng OTP của 1 email thật nào đó
    // ::: có nghĩa là thằng A nó có 1 email thật: nó lấy email đó để nhận OTP thật
    // ::: sau đó nó lấy OTP đó để đkí cho cái email ảo nào đó
    await this.checkCodeAuthFromEmail(userCreateDto.token, userCreateDto.email);

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
      user_id: user._id,
      email: user.email,
      password: userCreateDto.password,
    });
    await this._createToken(user.email);

    return {
      status: 'Successfully!',
      msg: 'Chúc mừng bạn đã đăng ký thành công!',
    };
  }

  // gửi OTP xác nhận email
  async sendCodeAuthToEmail(email: string): Promise<IResponse> {
    const codeAuth = await randomInt(0, 999999).toString().padStart(6, '0'); //tạo ra 6 số ngẫu nhiên
    await this.tokenVerifyEmailRepository.create({
      email: email, // để so sánh email của người nhận OTP với email của người đang thực hiện đăng ký
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
  async checkCodeAuthFromEmail(token: string, email: string): Promise<void> {
    const codeAuth = await this.tokenVerifyEmailRepository.findByCondition({
      token,
    });
    if (!codeAuth || email != codeAuth.email) {
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
