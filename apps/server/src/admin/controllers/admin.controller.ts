import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminLoginDto } from './../dto/admin.dto';
import { AdminService } from '../services/admin.service';
import { AdminRegisterDto } from '../dto/admin.dto';
import { IAdmin } from '../interfaces/admin.interface';
import { ResetPasswordDto } from './../dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async register(@Body() adminRegisterDto: AdminRegisterDto): Promise<IAdmin> {
    return await this.adminService.register(adminRegisterDto);
  }

  @Post('login')
  async login(
    @Body() adminLoginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAdmin> {
    const data = await this.adminService.login(adminLoginDto);
    const secretData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
    res.cookie('auth-cookie', secretData, { httpOnly: true });
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: { admin: IAdmin },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.adminService.logout(req.admin);
    res.cookie('auth-cookie', '', { httpOnly: true });
    return {
      status: 200,
      message: 'Logout successfully!',
    };
  }

  @Get('refresh_token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh from cookies
    const authCookie = request?.cookies['auth-cookie'];

    //Refresh token to get access token
    const data = await this.adminService.refreshToken(authCookie.refresh_token);

    //Update accessToken to cookies
    const secretData = {
      access_token: data.access_token,
      refresh_token: authCookie.refresh_token,
    };
    res.cookie('auth-cookie', secretData, { httpOnly: true });

    return data;
  }

  @Post('request_reset_password')
  async requestResetPassword(@Body() payload: any): Promise<{ link: string }> {
    return this.adminService.requestResetPassword(payload.email);
  }

  @Post('reset_password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    return this.adminService.resetPassword(resetPasswordDto);
  }
}
