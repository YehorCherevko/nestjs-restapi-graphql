import { InputType, Field, PartialType } from "@nestjs/graphql";
import { UserRole } from "src/user/enums/user-roles";

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  nickname?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  salt?: string;

  @Field({ nullable: true })
  role?: UserRole;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  lastVotedAt?: Date;
}

@InputType()
export class UpdateUserInputPartial extends PartialType(UpdateUserInput) {}
