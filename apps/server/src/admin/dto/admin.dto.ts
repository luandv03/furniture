import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
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
  @Matches('password', 'Password no match')
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

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

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
  @Matches('password', 'Password no match')
  password_confirm: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
