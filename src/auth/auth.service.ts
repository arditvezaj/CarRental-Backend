import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { UserWithoutPassword } from "../users/dto/user-without-password.dto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { LoginResponse } from "./types/jwt-token";
import { JwtPayload } from "./types/jwt-payload";
import { RequestUser } from "./types/request-user";
import { RolesService } from "src/roles/roles.service";
import * as bcrypt from "bcrypt";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService
  ) {}

  async validateUser(
    email: string,
    pass: string
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as UserWithoutPassword;
    }
    return null;
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    const payload = this.jwtService.verify(token);
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    const newAccessToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
        role: user.role,
      },
      { expiresIn: "7d" }
    );

    return {
      access_token: newAccessToken,
      refresh_token: token,
      account: { ...user },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException(`Benutzer ${loginDto.email} nicht gefunden.`);
    }

    const passwordIsCorrect = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException("Das Passwort ist falsch.");
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "7d" });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "1 year",
    });

    const userAccount: any = await this.usersService.findOne(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      account: { ...userAccount },
    };
  }

  async adminLogin(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException(`Benutzer ${loginDto.email} nicht gefunden.`);
    }

    const passwordIsCorrect = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException("Das Passwort ist falsch.");
    }
    const userHasAdminAccess = await this.rolesService.userHasAdminAccess(
      user.id
    );

    // if (!userHasAdminAccess) {
    //   throw new UnauthorizedException("Benutzer hat keinen Admin-Zugang");
    // }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const userAccount: any = await this.usersService.findOne(user.id);

    const accessToken = this.jwtService.sign(payload, { expiresIn: "12h" });

    return {
      access_token: accessToken,
      account: { ...userAccount },
    };
  }

  async getProfile(user: RequestUser): Promise<UserWithoutPassword> {
    const account: any = await this.usersService.findOne(user.id);

    return {
      ...account,
    };
  }

  async logout(): Promise<boolean> {
    return true;
  }
}
