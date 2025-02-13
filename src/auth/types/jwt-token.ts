import { UserWithoutPassword } from "src/users/dto/user-without-password.dto";

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  account: UserWithoutPassword;
};
