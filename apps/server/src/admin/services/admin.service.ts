import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from '../repositories/admin.repository';
import { IAdmin, IToken } from './../interfaces/admin.interface';
import { AdminRegisterDto, AdminLoginDto } from '../dto/admin.dto';
import { jwtConstrant } from '../constrant/jwt.config';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(adminRegisterDto: AdminRegisterDto): Promise<IAdmin> {
    const admin = await this.createAccount(adminRegisterDto);
    const token = await this._createToken(admin.email);

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
    const { email, password, password_confirm } = payload;
    const user = await this.findByEmail(email, 'email'); //lay ra moi field = "email"
    if (user) {
      throw new HttpException(
        'User already exists!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (password !== password_confirm) {
      throw new HttpException('Password no match', HttpStatus.NOT_ACCEPTABLE);
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
}
