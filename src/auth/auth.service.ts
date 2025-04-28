import {
  Injectable,
  Inject,
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
import * as nodemailer from "nodemailer";
import { Cache } from "cache-manager";

@Injectable()
export class AuthService {
  private transporter;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    @Inject("CACHE_MANAGER") private readonly cacheManager: Cache
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD, // Use the app-specific password here
      },
    });
  }

  ////////////

  async sendClientMail(email: string, subject: string, message: string) {
    const mailOptions = {
      from: `<${process.env.EMAIL}>`,
      to: "arditvezaj11@gmail.com",
      subject: `Dashboard : ${subject}`,
      text: `From: <${email}>\nMessage: ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p><strong>From:</strong> &lt;${email}&gt;</p>
          <p style="font-size: 16px; line-height: 1.5; padding: 10px; background-color: #f9f9f9; border-radius: 8px;">
            ${message}
          </p>
        </div>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendMail(name: string, email: string, message: string) {
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL}>`,
      to: "arditvezaj11@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      text: `From: ${name} <${email}>\nMessage: ${message}`,
      html: `
        <p>From: ${name} &lt;${email}&gt;</p>
        <p>Message: ${message}</p>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async returnMail(name, email) {
    const signature = `
        Best regards,
        <br>
        Drospect Team
        <br>
        <br>
        <i>Enabling AI-powered inspection of energy infrastructure ☀️</i>
        <br>
        <img src="https://storage.googleapis.com/solar-panel-detection-1.appspot.com/drospect_logo/Group%20110.png" alt="Drospect">
    `;

    const customisedMessage = `
        Dear ${name},
        <br><br>
        Thank you for reaching out. This is a confirmation that we have received your request. Our team will be on it right away and contact you very soon.
        <br><br>
        ${signature}
    `;

    const mailOptions = {
      from: `"Drospect" <${process.env.EMAIL}>`,
      to: email,
      subject: `Confirmation of your message, ${name}`,
      text: `
        Dear ${name},

        Thank you for reaching out. This is a confirmation that we have received your request. Our team will be on it right away and contact you very soon.
      `,
      html: customisedMessage,
    };
    return this.transporter.sendMail(mailOptions);
  }

  //////

  async sendVerificationCode(email: string, code: string) {
    await this.cacheManager.set(`verify-${email}`, code, 600);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Car Rental info@car.rental" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
    });
  }

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
      throw new NotFoundException(`User ${loginDto.email} cannot be found.`);
    }

    const passwordIsCorrect = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException("Password is incorrect.");
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
      throw new NotFoundException(`User ${loginDto.email} cannot be found.`);
    }

    const passwordIsCorrect = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    if (!passwordIsCorrect) {
      throw new UnauthorizedException("Password is incorrect.");
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
