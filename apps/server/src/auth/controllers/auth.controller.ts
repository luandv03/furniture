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
import { IResponse } from 'src/common/response.interface';
import { UserCreateDto } from '../dto/userCreateDto.dto';
import { EmailLoginDto } from '../dto/userCreateDto.dto';
import { IUser } from '../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleOAuth2Guard } from '../guards/google-oauth2.guard';
import { IGoogleOAuth2Payload } from '../interfaces/google-oauth2-payload.interface';
import { EmailAuthService } from '../services/email-auth.service';
import { GoogleAuthService } from '../services/google-auth.servcie';

@Controller('auth')
export class CustomerController {
  constructor(
    private readonly emailAuthService: EmailAuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('/register/email')
  async registerAccountWithEmail(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<IResponse> {
    return this.emailAuthService.registerAccountWithEmail(userCreateDto);
  }

  @Get('/register/email/verify')
  async verifyEmail(@Body('email') email: string): Promise<IResponse> {
    return this.emailAuthService.sendOtpToEmail(email);
  }

  @Post('/login/email')
  async loginWithEmail(
    @Body() emailLoginDto: EmailLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IUser> {
    const data = await this.emailAuthService.loginWithEmail(emailLoginDto);
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
    const response = await this.emailAuthService.logoutWithEmail(
      req.user.email,
    );

    res.clearCookie('auth-token');

    return response;
  }

  @Post('/refresh_token')
  async refeshTokenWithEmail(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const authToken = request?.cookies['auth-token'];

    const token = await this.emailAuthService.refreshTokenWithEmail(
      authToken?.refresh_token,
    );

    const sercretData = {
      access_token: token?.access_token,
      ...authToken,
    };

    res.cookie('auth-token', sercretData, { httpOnly: true });

    return token;
  }

  @Get('/google/login')
  @UseGuards(GoogleOAuth2Guard)
  async loginWithGoolge(@Req() req: Request): Promise<void> {
    console.log(req.user);
    console.log(':::server is listening on client 30000');
  }

  @Get('/google/google-callback')
  @UseGuards(GoogleOAuth2Guard)
  async googleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user: IGoogleOAuth2Payload | any = req.user;
    const data = await this.googleAuthService.googleLogin(user);

    const sercretData = {
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
    };

    res.cookie('auth-token', sercretData, { httpOnly: true });

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/google/logout')
  async logoutWithGoogle(
    @Req() req: { user: IUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const response = await this.googleAuthService.logoutWithGoogle(
      req.user.email,
    );

    res.clearCookie('auth-token');

    return response;
  }

  @Get('/google/refresh_token')
  async refeshTokenWithGoogle(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const authToken = request?.cookies['auth-token'];

    const token = await this.googleAuthService.refreshTokenWithGoogle(
      authToken?.refresh_token,
    );

    const sercretData = {
      access_token: token?.access_token,
      ...authToken,
    };

    res.cookie('auth-token', sercretData, { httpOnly: true });

    return token;
  }
}
