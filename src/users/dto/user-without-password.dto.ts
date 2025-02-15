import { Company } from "src/companies/entities/company.entity";
import type { User } from "../entities/user.entity";

export type UserWithoutPassword = Omit<User, "password"> & {
  activeOrganization?: Company;
};

export const accountFieldsWithoutPassword = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};
