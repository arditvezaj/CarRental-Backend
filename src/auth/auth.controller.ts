import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Request,
  Query,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/skip-auth.decorator";
import { UsersService } from "src/users/users.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LoginResponse } from "./types/jwt-token";
import { RequestUser } from "./types/request-user";
import { JwtService } from "@nestjs/jwt";
import { UserWithoutPassword } from "src/users/dto/user-without-password.dto";
import { Cache } from "cache-manager";

@ApiBearerAuth()
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject("CACHE_MANAGER") private cacheManager: Cache
  ) {}

  @Public()
  @Post("send-mail")
  async sendMail() {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    await this.authService.sendClientMail(
      "arditvezaj11@gmail.com",
      "subject",
      code
    );

    return { message: "Verification code sent" };
  }

  @Public()
  @Post("send-verification")
  async sendVerification(@Body() { email }: { email: string }) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store the code in cache for 10 minutes
    await this.cacheManager.set(`verify-${email}`, code, 600);

    // Send the code via email
    await this.authService.sendVerificationCode(email, code);

    return { message: "Verification code sent" };
  }

  @Public()
  @Post("verify-code")
  async verifyCode(@Body() { email, code }: { email: string; code: string }) {
    const storedCode = await this.cacheManager.get(`verify-${email}`);

    if (!storedCode || storedCode !== code) {
      throw new BadRequestException("Invalid or expired code");
    }

    // Mark user as verified in database
    await this.usersService.verifyUser(email);

    // Remove code from cache after successful verification
    await this.cacheManager.del(`verify-${email}`);

    return { message: "Email verified successfully" };
  }

  @Public()
  @Post("refresh-token")
  async refreshToken(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    if (!refresh_token) {
      throw new BadRequestException("Refresh token must be provided");
    }
    return await this.authService.refreshToken(refresh_token);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "User login" })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post("admin-login")
  @ApiOperation({ summary: "Admin login" })
  async adminLogin(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.adminLogin(loginDto);
  }

  @Get("profile")
  @ApiOperation({ summary: "Get user profile" })
  getProfile(@Request() req): Promise<UserWithoutPassword> {
    return this.authService.getProfile(req.user as RequestUser);
  }

  @Patch("reset-password")
  @ApiOperation({ summary: "Reset user password" })
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.usersService.resetPassword(req.user.id, resetPasswordDto);
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout user" })
  async logout() {
    return this.authService.logout();
  }
}
