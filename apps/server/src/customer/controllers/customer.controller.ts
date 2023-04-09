import { Controller, Body, Post, Get } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { IResponse } from 'src/common/response.interface';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { EmailLoginDto } from '../dto/userCreateDto.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/register/email')
  async registerAccountWithEmail(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<IResponse> {
    return this.customerService.registerAccountWithEmail(userCreateDto);
  }

  @Get('/register/email/verify')
  async verifyEmail(@Body('email') email: string): Promise<IResponse> {
    return this.customerService.sendCodeAuthToEmail(email);
  }

  @Post('/login/email')
  async loginWithEmail(@Body() emailLoginDto: EmailLoginDto): Promise<any> {
    return await this.customerService.loginWithEmail(emailLoginDto);
  }
}
