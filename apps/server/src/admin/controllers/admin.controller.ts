import { Controller, Post, Body } from '@nestjs/common';
import { AdminLoginDto } from './../dto/admin.dto';
import { AdminService } from '../services/admin.service';
import { AdminRegisterDto } from '../dto/admin.dto';
import { IAdmin } from '../interfaces/admin.interface';

@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async register(@Body() adminRegisterDto: AdminRegisterDto): Promise<IAdmin> {
    console.log('payload', adminRegisterDto);
    return await this.adminService.register(adminRegisterDto);
  }

  @Post('login')
  async login(adminLoginDto: AdminLoginDto): Promise<IAdmin> {
    return await this.adminService.login(adminLoginDto);
  }
}
