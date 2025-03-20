import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesModule } from "./companies/companies.module";
import { Company } from "./companies/entities/company.entity";
import { UsersModule } from "./users/users.module";
import { User } from "./users/entities/user.entity";
import { RolesModule } from "./roles/roles.module";
import { Role } from "./roles/entities/role.entity";
import { Permission } from "./roles/entities/permission.entity";
import { AuthModule } from "./auth/auth.module";
import { SeedModule } from "./seed/seed.module";
import { CompaniesController } from "./companies/companies.controller";
import { CarsModule } from './cars/cars.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: "postgres",
    //     host: configService.get("DB_HOST"),
    //     port: +configService.get("DB_PORT"),
    //     username: configService.get("DB_USERNAME"),
    //     password: configService.get("DB_PASSWORD"),
    //     database: configService.get("DB_NAME"),
    //     ssl: true,
    //     entities: [Company, User, Role, Permission],
    //     synchronize: true,
    //   }),
    // }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5433,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    CompaniesModule,
    UsersModule,
    RolesModule,
    SeedModule,
    CarsModule,
  ],
  controllers: [CompaniesController],
  providers: [],
})
export class AppModule {}
