import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { jwtConstrant } from 'src/admin/constrant/jwt.config';
import { AuthService } from './../services/auth.service';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-token'];
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
  async validate(payload: { email: string }): Promise<IUser> {
    const user = await this.authService.validate(payload.email);

    return user;
  }
}
