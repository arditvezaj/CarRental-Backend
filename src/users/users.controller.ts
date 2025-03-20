import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiOperation, ApiBody, ApiTags } from "@nestjs/swagger";
import { PermissionsGuard } from "src/roles/guards/permissions.guard";
import { Permissions } from "src/roles/decorators/permissions.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { Public } from "src/auth/decorators/skip-auth.decorator";

@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("check-email")
  async checkEmail(
    @Query("email") email: string,
    @Req() req
  ): Promise<{ exists: boolean }> {
    const exists = await this.usersService.checkEmailExists(req.user.id, email);
    return { exists };
  }

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  // @UseGuards(PermissionsGuard)
  // @Permissions(PredefinedPermissions.VIEW_WORKER)
  @ApiOperation({ summary: "Get all users" })
  findAll(@Req() req) {
    const currentUserId = req.user.id;
    return this.usersService.findAll(currentUserId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by ID" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user by ID" })
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  // @Delete('image/:publicId')
  // @ApiOperation({ summary: 'Delete user image' })
  // deleteImage(@Param('publicId') publicId: string): Promise<void> {
  //   return this.usersService.deleteImage(publicId);
  // }

  // @Delete('images/:publicIds')
  // @ApiOperation({ summary: 'Delete user images' })
  // deleteImages(@Param('publicIds') publicIds: string): Promise<void> {
  //   const publicIdArray = publicIds.split(',');
  //   return this.usersService.deleteImages(publicIdArray);
  // }
}
