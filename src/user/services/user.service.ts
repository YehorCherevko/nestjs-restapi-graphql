import { Injectable, forwardRef, Inject } from "@nestjs/common";
import * as crypto from "crypto";
import { IUser } from "../interfaces/user-interface";
import * as Errors from "../../errors/errors";
import { VoteValue } from "src/user/enums/user-vote";
import { UserDTO } from "src/user/dto/user-dto";
import { generateJWTToken } from "src/utils/jwt-utils";
import { hashPassword, verifyPassword } from "src/utils/password-utils";
import { IUserRepository } from "src/user/interfaces/user-repository-interface";
import { UserRepository } from "../repositories/user-repository";
import { CreateUserDto } from "../dto/create-user-dto";
import { UpdateUserDto } from "../dto/update-user-dto";

const {
  InvalidVoteValueError,
  VoterNotFoundError,
  UserToVoteForNotFoundError,
  CannotVoteForYourselfError,
  VotingRateLimitExceededError,
  UserNotFoundError,
  PreconditionFailedError,
} = Errors;

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: IUserRepository
  ) {}

  async createUser(user: CreateUserDto): Promise<CreateUserDto> {
    const { nickname, firstName, lastName, password, role } = user;

    const existingUser = await this.userRepository.getUserByNickname(nickname);
    if (existingUser) {
      throw new Error("User with this nickname already exists");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await hashPassword(password, salt);

    const newUser: CreateUserDto = {
      nickname,
      firstName,
      lastName,
      password: hashedPassword,
      salt,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      role,
      lastVotedAt: null,
      rating: 0,
    };

    await this.userRepository.createUser(newUser);

    return newUser;
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    const user = await this.userRepository.getUserById(userId);

    if (!user || user.deleted_at != null) {
      throw new UserNotFoundError("User not found");
    }

    return user;
  }

  public async getUsersWithPagination(
    page: number,
    pageSize: number
  ): Promise<UserDTO[]> {
    const users = await this.userRepository.getUsersWithPagination(
      page,
      pageSize
    );

    return users.map((user) => new UserDTO(user));
  }

  public async updateUser(
    userId: string,
    updatedUser: UpdateUserDto,
    ifUnmodifiedSince: string
  ): Promise<UpdateUserDto | null> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    if (ifUnmodifiedSince) {
      const lastModified = new Date(user.updated_at);
      const ifUnmodifiedSinceDate = new Date(ifUnmodifiedSince);

      if (lastModified > ifUnmodifiedSinceDate) {
        throw new PreconditionFailedError("Resource has been modified");
      }
    }

    const updatedUserData = await this.userRepository.updateUser(
      userId,
      updatedUser
    );

    return updatedUserData;
  }

  public async deleteUser(userId: string): Promise<IUser | null> {
    const user = await this.userRepository.getUserById(userId);

    if (!user || user.deleted_at !== null) {
      throw new UserNotFoundError("User not found");
    }

    user.deleted_at = new Date();
    await this.userRepository.updateUser(userId, user);

    return user;
  }

  public async getUserByNickname(userNickname: string): Promise<IUser | null> {
    try {
      const user = await this.userRepository.getUserByNickname(userNickname);

      if (!user || user?.deleted_at != null) {
        throw new UserNotFoundError("User not found");
      }

      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async updateRating(
    voterId: string,
    userId: string,
    vote: number
  ): Promise<void> {
    const userWhoVotes = await this.userRepository.getUserById(voterId);
    if (!userWhoVotes || userWhoVotes.deleted_at != null) {
      throw new VoterNotFoundError("Voter not found or deleted.");
    }

    const userToVoteFor = await this.userRepository.getUserById(userId);
    if (!userToVoteFor || userToVoteFor.deleted_at != null) {
      throw new UserToVoteForNotFoundError(
        "User to vote for not found or deleted."
      );
    }

    if (userId === voterId) {
      throw new CannotVoteForYourselfError("You cannot vote for yourself.");
    }

    const canVote = this.canUserVote(userWhoVotes.lastVotedAt);
    if (!canVote) {
      throw new VotingRateLimitExceededError(
        "You can only vote once per hour."
      );
    }

    if (!this.isValidVote(vote)) {
      throw new InvalidVoteValueError(
        "Invalid vote value. Vote must be 1 (positive) or -1 (negative)."
      );
    }

    userToVoteFor.rating += vote;
    userWhoVotes.lastVotedAt = new Date();

    await this.userRepository.updateUser(userId, userToVoteFor);
    await this.userRepository.updateUser(voterId, userWhoVotes);
  }

  public canUserVote(lastVotedAt: Date | null): boolean {
    const now = new Date();
    const hour = 3600000;
    return !lastVotedAt || now.getTime() - lastVotedAt.getTime() >= hour;
  }

  private isValidVote(vote: number): boolean {
    return vote === VoteValue.Positive || vote === VoteValue.Negative;
  }

  public async loginUser(
    nickname: string,
    password: string
  ): Promise<string | null> {
    try {
      const user = await this.userRepository.getUserByNickname(nickname);

      if (!user || user.deleted_at != null) {
        return null;
      }

      const isPasswordValid = await verifyPassword(
        password,
        user.password,
        user.salt
      );

      if (!isPasswordValid) {
        return null;
      }

      const token = generateJWTToken(user);
      return token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
