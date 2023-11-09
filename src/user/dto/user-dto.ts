import { IsString, IsNotEmpty, IsEnum, IsNumber } from "class-validator";
import { UserRole } from "../enums/user-roles";
import { IUser } from "../interfaces/user-interface";

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  public nickname: string;

  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsNotEmpty()
  @IsString()
  public lastName: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  public role: string;

  @IsNotEmpty()
  @IsNumber()
  public rating: number;

  constructor(user: IUser) {
    this.nickname = user.nickname;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.rating = user.rating;
  }
}
