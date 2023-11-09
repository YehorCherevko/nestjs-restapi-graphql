import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { IUserRepository } from "../interfaces/user-repository-interface";
import { IUser } from "../interfaces/user-interface";
import { User, UserDocument } from "../schemas/user.schema";
import { UpdateUserDto } from "../dto/update-user-dto";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  public async createUser(user: IUser): Promise<IUser> {
    const createdUser = await this.userModel.create(user);
    return createdUser.toObject() as IUser;
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    const user = await this.userModel.findById(userId).exec();
    return user ? (user.toObject() as IUser) : null;
  }

  public async getUsersWithPagination(
    page: number,
    pageSize: number
  ): Promise<IUser[]> {
    const query = { deleted_at: null };

    const skip = (page - 1) * pageSize;
    const users = await this.userModel
      .find(query)
      .skip(skip)
      .limit(pageSize)
      .exec();

    return users.map((user) => user.toObject() as IUser);
  }

  public async updateUser(
    userId: string,
    updatedUser: UpdateUserDto
  ): Promise<UpdateUserDto | null> {
    updatedUser.updated_at = new Date();
    const updatedUserData = await this.userModel
      .findByIdAndUpdate(userId, updatedUser, { new: true })
      .exec();

    return updatedUserData ? updatedUserData.toObject() : null;
  }

  public async getUserByNickname(userNickname: string): Promise<IUser | null> {
    const user = await this.userModel
      .findOne({ nickname: userNickname })
      .exec();

    return user ? (user.toObject() as IUser) : null;
  }
}
