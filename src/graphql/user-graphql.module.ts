import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserResolver } from "./user.resolver";
import { UserGraphqlService } from "./user-graphql.service";
import { UserService } from "src/user/services/user.service";
import { UserRepository } from "src/user/repositories/user-repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserGraphqlService, UserResolver, UserService, UserRepository],
})
export class UserGraphqlModule {}
