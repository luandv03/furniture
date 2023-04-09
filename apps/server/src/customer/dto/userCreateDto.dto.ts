import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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
  token: string;
}
