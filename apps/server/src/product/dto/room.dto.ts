import { IsNotEmpty, IsString } from 'class-validator';

export class RoomCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
