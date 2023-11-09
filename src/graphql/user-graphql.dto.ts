import { ObjectType, Field, ID } from "@nestjs/graphql";
import { UserRole } from "src/user/enums/user-roles";

@ObjectType("User")
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  nickname: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  password: string;

  @Field()
  salt: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field({ nullable: true })
  deleted_at: Date;

  @Field()
  role: UserRole;

  @Field()
  rating: number;

  @Field({ nullable: true })
  lastVotedAt: Date;
}
