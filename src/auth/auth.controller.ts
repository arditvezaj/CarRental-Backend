import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/skip-auth.decorator';
import { UsersService } from 'src/users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponse } from './types/jwt-token';
import { RequestUser } from './types/request-user';
import { UserWithoutPassword } from 'src/users/dto/user-without-password.dto';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    if (!refresh_token) {
      throw new BadRequestException('Refresh token must be provided');
    }
    return await this.authService.refreshToken(refresh_token);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('admin-login')
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.adminLogin(loginDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Request() req): Promise<UserWithoutPassword> {
    return this.authService.getProfile(req.user as RequestUser);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(req.user.id, resetPasswordDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    return this.authService.logout();
  }
}
