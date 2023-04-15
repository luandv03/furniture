import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { EmailLoginRepository } from '../repositories/email-login.repository';
import { EmailLoginDto } from '../dto/userCreateDto.dto';
import { IUser } from '../interfaces/user.interface';
import { IResponse } from 'src/common/response.interface';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { OtpService } from './../../otp/service/otp.service';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly emailLoginRepository: EmailLoginRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  async registerAccountWithEmail(
    userCreateDto: UserCreateDto,
  ): Promise<IResponse> {
    const userCheckExist = await this.userService.findUserByEmail(
      userCreateDto.email,
    );

    // check user exist in google | email account ?
    await this.userService.checkUserExist(userCheckExist);

    // kiểm tra mã OTP có hợp lệ hay không
    // Và check xem email của người gửi đăng kí có trùng với email người nhận OTP hay không
    // để tránh trường hợp dùng email ảo đkí bằng OTP của 1 email thật nào đó
    // ::: có nghĩa là thằng A nó có 1 email thật: nó lấy email đó để nhận OTP thật
    // ::: sau đó nó lấy OTP đó để đkí cho cái email ảo nào đó
    await this.otpService.checkCodeAuthFromEmail(
      userCreateDto.token,
      userCreateDto.email,
    );

    // sau khi validate đã ok thì tạo mới user trong db
    const user = await this.userService.createUser(userCreateDto);

    /// Cần xem lại logic chỗ này
    await this.userService.findUserByIdAndUpdate(user._id, {
      email_verified: true,
    });

    // sau khi tạo xong thì xóa token OTP trong db đi
    await this.otpService.deleteOtp({
      token: userCreateDto.token,
    });

    // tiến hành tạo user trong EmailLogin db để validate khi login với email account
    userCreateDto.password = await bcrypt.hash(userCreateDto.password, 10); // hash password before save to db
    await this.emailLoginRepository.create({
      user_id: user._id,
      email: user.email,
      password: userCreateDto.password,
    });
    await this.authService._createToken(user.email);

    return {
      status: 'Successfully!',
      msg: 'Chúc mừng bạn đã đăng ký thành công!',
    };
  }

  async loginWithEmail(emailLoginDto: EmailLoginDto): Promise<IUser> {
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

    const token = await this.authService._createToken(email);

    // update refesh token in database
    await this.authService.updateRefreshToken(
      { email },
      { refresh_token: token.refresh_token },
      this.emailLoginRepository,
    );

    return {
      user_id: user.user_id._id,
      name: user.user_id.name,
      email: user.email,
      ...token,
    };
  }

  async logoutWithEmail(email: string): Promise<IResponse> {
    await this.authService.updateRefreshToken(
      { email: email },
      { refresh_token: null },
      this.emailLoginRepository,
    );

    return {
      status: 'successfully!',
      msg: 'Logouted!',
    };
  }

  async refreshTokenWithEmail(refresh_token: string): Promise<any> {
    return await this.authService.refreshToken(
      refresh_token,
      this.emailLoginRepository,
    );
  }

  async sendOtpToEmail(email: string): Promise<IResponse> {
    return await this.otpService.sendCodeAuthToEmail(email);
  }
}
