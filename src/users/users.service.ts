import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { hashPassword } from "src/auth/utils";
import { Not } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async checkEmailExists(id: number, email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: Not(id), email },
    });
    return !!user;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const saltRounds = 10;
      // const salt = await bcrypt.genSalt(saltRounds);
      const password = await bcrypt.hash(createUserDto.password, saltRounds);

      const user = this.usersRepository.create({
        ...createUserDto,
        password,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException(
          "Mitarbeiter mit dieser E-Mail existiert bereits"
        );
      }
      throw error;
    }
  }

  async findAll(currentUserId?: number | null): Promise<User[]> {
    const users =
      currentUserId == undefined
        ? this.usersRepository.find({ order: { name: "ASC" } })
        : this.usersRepository.find({
            where: {
              id: Not(currentUserId),
            },
            order: { name: "ASC" },
          });

    return users;
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (updateUserDto.password) {
        const isHashedPassword =
          updateUserDto.password.length === user.password.length;
        const isSamePassword = isHashedPassword
          ? updateUserDto.password === user.password
          : await bcrypt.compare(updateUserDto.password, user.password);

        if (isSamePassword) {
          delete updateUserDto.password;
        } else if (!isHashedPassword) {
          const saltRounds = 10;
          updateUserDto.password = await bcrypt.hash(
            updateUserDto.password,
            saltRounds
          );
        }
      }

      Object.assign(user, updateUserDto);

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException(
          "Mitarbeiter mit dieser E-Mail existiert bereits"
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersRepository.remove(user);
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async resetPassword(id: number, resetPasswordDto: ResetPasswordDto) {
    return this.usersRepository.update(id, {
      password: hashPassword(resetPasswordDto.password),
    });
  }

  async seedAdminAccount() {
    const numAccounts = await this.usersRepository.count();

    if (numAccounts > 0) return;

    const adminDetails: any = {
      name: "Ardit Vezaj",
      email: "arditvezaj1@gmail.com",
      password: "password",
    };

    const admin = await this.create(adminDetails);

    return this.findOne(admin.id);
  }

  // async deleteImage(publicId: string): Promise<void> {
  //   cloudinary.config({
  //     cloud_name: 'dev5szzyt',
  //     api_key: '414523388966149',
  //     api_secret: 'pBbaITWDMHr1eYj-EWwKTQc4_CE',
  //     secure: true,
  //   });

  //   try {
  //     const result = await cloudinary.uploader.destroy(
  //       'mitarbeiter/' + publicId,
  //     );
  //   } catch (error) {
  //     throw new Error(`Failed to delete image: ${error.message}`);
  //   }
  // }

  // async deleteImages(publicIds: string[]): Promise<void> {
  //   cloudinary.config({
  //     cloud_name: 'dev5szzyt',
  //     api_key: '414523388966149',
  //     api_secret: 'pBbaITWDMHr1eYj-EWwKTQc4_CE',
  //     secure: true,
  //   });

  //   try {
  //     const publicIdsWithPath = publicIds.map(
  //       (publicId) => 'mitarbeiter/' + publicId,
  //     );

  //     const result = await cloudinary.api.delete_resources(publicIdsWithPath);
  //   } catch (error) {
  //     throw new Error(`Failed to delete images: ${error.message}`);
  //   }
  // }
}
