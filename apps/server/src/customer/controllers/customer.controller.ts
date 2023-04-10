import {
  Controller,
  Body,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomerService } from '../services/customer.service';
import { IResponse } from 'src/common/response.interface';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { EmailLoginDto } from '../dto/userCreateDto.dto';
import { IUser } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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
  async loginWithEmail(
    @Body() emailLoginDto: EmailLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IUser> {
    const data = await this.customerService.loginWithEmail(emailLoginDto);
    const secretData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    res.cookie('auth-token', secretData, { httpOnly: true });
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout/email')
  async logoutWithEmail(
    @Req() req: { user: IUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const response = await this.customerService.logoutWithEmail(req.user.email);
    const secretData = {
      access_token: null,
      refresh_token: null,
    };

    res.cookie('auth-token', secretData, { httpOnly: true });

    return response;
  }

  @Post('/refresh_token/email')
  async refeshTokenWithEmail(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const authToken = request?.cookies['auth-token'];

    const token = await this.customerService.refreshTokenWithEmail(
      authToken.refresh_token,
    );

    const sercretData = {
      access_token: token?.access_token,
      ...authToken,
    };

    res.cookie('auth-token', sercretData, { httpOnly: true });

    return token;
  }
}
