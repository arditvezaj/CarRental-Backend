import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  address: string;

  @IsOptional()
  @ApiProperty()
  isEmailVerified: boolean;
}
