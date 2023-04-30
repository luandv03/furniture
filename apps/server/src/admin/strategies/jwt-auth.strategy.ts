import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from '../services/admin.service';
import { jwtConstrant } from '../constrant/jwt.config';
import { IAdmin } from './../interfaces/admin.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-cookie'];
          if (!data) {
            return null;
          }
          return data.access_token;
        },
      ]),
      secretOrKey: jwtConstrant.SECRET_KEY,
    });
  }

  //By default, the 'validate()' method in strategy only sends the payload of the decrypted access token.
  //Ở đây nó sẽ tự động lấy token trên Header để giải mã (nhìn vào line 11 ở trên) sẽ được 1 Object (payload)
  //chứa { email, iat, exp } khi login chúng ta dùng jwtService.sign() bên AdminService
  async validate(payload: { email: string }): Promise<IAdmin> {
    const admin = await this.adminService.validate(payload.email);

    return admin;
  }
}
