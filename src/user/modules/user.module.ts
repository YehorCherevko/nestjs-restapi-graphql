import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { User, UserSchema } from "../schemas/user.schema";
import { config } from "../../config/config";
import { UserRepository } from "../repositories/user-repository";
import { JwtAuthGuard } from "src/jwt/jwt-auth-guard";

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUri),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard],
  exports: [UserService],
})
export class UserModule {}
