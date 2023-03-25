import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from '../repositories/admin.repository';
import { IAdmin } from './../interfaces/admin.interface';
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
    return { login: adminLoginDto } as any;
  }

  async createAccount(payload: AdminRegisterDto): Promise<any> {
    const { email, password, password_confirm } = payload;
    const user = await this.findByEmail(email);
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
      const accessToken = this.jwtService.sign(
        { email },
        {
          expiresIn: jwtConstrant.EXPIRES_IN,
          secret: jwtConstrant.SECRET_KEY,
        },
      );
      const refreshToken = this.jwtService.sign(
        { email },
        {
          expiresIn: jwtConstrant.EXPIRES_IN_REFRESH,
          secret: jwtConstrant.SECRET_KEY_REFRESH,
        },
      );

      await this.update({ email }, { refreshToken });

      return {
        accessToken,
        refreshToken,
        expiresIn: jwtConstrant.EXPIRES_IN,
        expiresIn_Refresh: jwtConstrant.EXPIRES_IN_REFRESH,
      };
    } else {
      // refresh: false (dùng cho trường hợp refesh token (access token hết hạn) thì sẽ cần lấy access token mới)
      const accessToken = this.jwtService.sign({ email });
      return {
        accessToken,
        expiresIn: jwtConstrant.EXPIRES_IN,
      };
    }
  }

  async findByEmail(email: string): Promise<any> {
    return this.adminRepository.findByCondition({ email }, '-password');
  }

  //update refresh token
  async update(filter: any, update: any): Promise<any> {
    if (update.refreshToken) {
      update.refreshToken = await bcrypt.hash(update.refreshToken, 10);
    }

    return await this.adminRepository.findByConditionAndUpdate(filter, update);
  }
}
