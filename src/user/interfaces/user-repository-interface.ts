import { IUser } from "./user-interface";
import { CreateUserDto } from "../dto/create-user-dto";
import { UpdateUserDto } from "../dto/update-user-dto";

export interface IUserRepository {
  createUser(user: CreateUserDto): Promise<CreateUserDto>;
  getUserById(userId: string): Promise<IUser | null>;
  getUsersWithPagination(page: number, pageSize: number): Promise<IUser[]>;
  updateUser(
    userId: string,
    updatedUser: UpdateUserDto
  ): Promise<UpdateUserDto | null>;
  getUserByNickname(userNickname: string): Promise<IUser | null>;
}
