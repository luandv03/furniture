import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { RoomCreateDto } from './../dto/room.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RoomService } from '../services/room.service';
import { JwtAuthGuard } from 'src/admin/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Room } from '../schemas/room.schema';

@Roles(Role.POSTER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() roomCreateDto: RoomCreateDto): Promise<any> {
    return this.roomService.createRoom(roomCreateDto);
  }

  @Get()
  async getRoomAll(): Promise<Room[]> {
    return this.roomService.getRoomAll();
  }

  @Get('/:roomId')
  async getRoomById(@Param('roomId') roomId: string): Promise<Room> {
    return this.roomService.getRoomById(roomId);
  }

  @Put('/:roomId')
  async updateRoomById(
    @Param('roomId') roomId: string,
    @Body() payload: RoomCreateDto,
  ): Promise<Room> {
    return this.roomService.updateRoomById(roomId, payload);
  }

  @Delete('/:roomId')
  async deleteRoomById(roomId: string): Promise<any> {
    return this.roomService.deleteRoomById(roomId);
  }
}
