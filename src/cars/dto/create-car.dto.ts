import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateCarDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  make: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  transmission: string;

  @ApiProperty()
  fuel: string;

  @ApiProperty()
  firstRegistration: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  engine: string;

  @ApiProperty()
  date: Date | string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  @IsOptional()
  isPremium: boolean;
}
