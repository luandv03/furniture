import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { randomInt } from 'crypto';

import { OptRepository } from '../repositories/otp.reposiroty';
import { IResponse } from 'src/common/response.interface';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OptRepository,
    private readonly mailerService: MailerService,
  ) {}

  // gửi OTP xác nhận email
  async sendCodeAuthToEmail(email: string): Promise<IResponse> {
    const codeAuth = await randomInt(0, 999999).toString().padStart(6, '0'); //tạo ra 6 số ngẫu nhiên
    await this.otpRepository.create({
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
    const codeAuth = await this.otpRepository.findByCondition({
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
      await this.otpRepository.deleteByCondition({
        token,
      });

      throw new HttpException(
        'Mã OTP đã hết hạn, vui lòng lấy mã OTP mới',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async deleteOtp(condition: any): Promise<void> {
    await this.otpRepository.deleteByCondition(condition);
  }

  // xóa những mã OTP đã hết hạn trong hệ thống do user yêu cầu cấp OTP qua email nhưng lại không sử dụng
  async deleteOtpExpired(): Promise<IResponse> {
    await this.otpRepository.deleteByCondition({
      expires: {
        $lte: Date.now(),
      },
    });

    return {
      status: 'Successfully',
      msg: 'Deleted',
    };
  }
}
