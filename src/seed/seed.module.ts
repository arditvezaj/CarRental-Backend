import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { SeedController } from "./seed.controller";
import { UsersModule } from "src/users/users.module";
import { RolesModule } from "src/roles/roles.module";

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
