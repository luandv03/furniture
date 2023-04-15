import { Controller, Delete } from '@nestjs/common';
import { OtpService } from '../service/otp.service';
import { IResponse } from 'src/common/response.interface';

@Controller('/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Delete('/delete/otp_expired')
  async deleteOtpExpired(): Promise<IResponse> {
    return this.otpService.deleteOtpExpired();
  }
}
