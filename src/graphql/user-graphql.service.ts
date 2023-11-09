import { Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserInput } from "./create-user.input";
import { User, UserDocument } from "../user/schemas/user.schema";

@Injectable()
export class UserGraphqlService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const createdUser = new this.userModel(input);
    return createdUser.save();
  }
}
