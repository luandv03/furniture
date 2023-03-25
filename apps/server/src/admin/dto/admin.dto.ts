import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AdminRegisterDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Pass must least 8 character letters',
  })
  @MaxLength(25, {
    message: 'Pass too length!',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Pass must least 8 character letters',
  })
  @MaxLength(25, {
    message: 'Pass too length!',
  })
  password_confirm: string;
}

export class AdminLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Pass must least 8 character letters',
  })
  @MaxLength(25, {
    message: 'Pass too length!',
  })
  password: string;
}
