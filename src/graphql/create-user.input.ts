import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, IsDate, IsEnum, IsNumber } from "class-validator";
import { UserRole } from "src/user/enums/user-roles";

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty({ message: "Nickname should not be empty" })
  nickname: string;

  @Field()
  @IsNotEmpty({ message: "First name should not be empty" })
  firstName: string;

  @Field()
  @IsNotEmpty({ message: "Last name should not be empty" })
  lastName: string;

  @Field()
  @IsNotEmpty({ message: "Password should not be empty" })
  password: string;

  @Field()
  @IsNotEmpty({ message: "Salt should not be empty" })
  salt: string;

  @Field()
  @IsDate({ message: "Invalid created_at date" })
  created_at: Date;

  @Field()
  @IsDate({ message: "Invalid updated_at date" })
  updated_at: Date;

  @Field()
  @IsDate({ message: "Invalid deleted_at date" })
  deleted_at: Date;

  @Field()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @Field()
  @IsNumber({}, { message: "Rating should be a number" })
  rating: number;

  @Field()
  @IsDate({ message: "Invalid lastVotedAt date" })
  lastVotedAt: Date;
}
