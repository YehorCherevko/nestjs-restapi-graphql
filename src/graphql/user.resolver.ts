import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UserGraphqlService } from "./user-graphql.service";
import { UserType } from "./user-graphql.dto";
import { CreateUserInput } from "./create-user.input";
import { UpdateUserInput } from "./update-user.input";
import { NotFoundException, ValidationPipe, UsePipes } from "@nestjs/common";
import { UserService } from "src/user/services/user.service";

@Resolver("User")
export class UserResolver {
  constructor(
    private readonly userGraphqlService: UserGraphqlService,
    private readonly userService: UserService
  ) {}

  @Query(() => [UserType])
  async users() {
    return this.userGraphqlService.findAll();
  }

  @Query(() => UserType)
  async user(@Args("id") id: string) {
    const user = await this.userGraphqlService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Mutation(() => UserType)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Args("input") input: CreateUserInput) {
    return this.userGraphqlService.create(input);
  }

  @Mutation(() => UserType)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Args("id") id: string,
    @Args("input") input: UpdateUserInput
  ) {
    const user = await this.userService.updateUser(id, input, "");
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Mutation(() => UserType)
  async deleteUser(@Args("id") id: string) {
    const user = await this.userService.deleteUser(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Query(() => [UserType])
  async paginatedUsers(
    @Args("page") page: number,
    @Args("pageSize") pageSize: number
  ) {
    return this.userService.getUsersWithPagination(page, pageSize);
  }

  @Query(() => UserType)
  async userByNickname(@Args("nickname") nickname: string) {
    const user = await this.userService.getUserByNickname(nickname);
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found`);
    }
    return user;
  }
}
