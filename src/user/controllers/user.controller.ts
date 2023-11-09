import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Req,
  Res,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Header,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import { UserService } from "../services/user.service";
import { UserDTO } from "src/user/dto/user-dto";
import * as Errors from "../../errors/errors";
import { HttpHeaders } from "src/http/http-headers";
import { JwtUser } from "src/user/interfaces/user-interface";
import { JwtAuthGuard } from "src/jwt/jwt-auth-guard";
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

@Controller("api/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response
  ) {
    try {
      const newUser = await this.userService.createUser(createUserDto);
      response.status(HttpStatus.CREATED).json(newUser);
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error creating user" });
    }
  }

  @Get(":userId")
  async getUserById(
    @Param("userId") userId: string,
    @Res() response: Response
  ) {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        return response.status(HttpStatus.NOT_FOUND).json({
          message: "User not found",
        });
      }

      const userDataTransferObject = new UserDTO(user);
      response.setHeader("Last-Modified", user.updated_at.toUTCString());
      response.json(userDataTransferObject);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        console.error(error);
        response.status(HttpStatus.NOT_FOUND).json({
          message: error.message,
        });
      }

      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error fetching user" });
    }
  }

  @Put(":userId")
  @UseGuards(JwtAuthGuard)
  @Header(HttpHeaders.ContentType, "application/json")
  @Header(HttpHeaders.LastModified, "")
  async updateUser(
    @Param("userId") userId: string,
    @Body() updatedUser: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const ifUnmodifiedSince = req.get(HttpHeaders.IfUnmodifiedSince) || "";

      const updatedUserResult = await this.userService.updateUser(
        userId,
        updatedUser,
        ifUnmodifiedSince
      );

      if (!updatedUserResult) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: "User not found" });
      }

      res.setHeader(
        HttpHeaders.LastModified,
        updatedUserResult.updated_at.toUTCString()
      );

      return res.json(updatedUserResult);
    } catch (error) {
      console.error(error);
      if (error instanceof UserNotFoundError) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
      } else if (error instanceof PreconditionFailedError) {
        res
          .status(HttpStatus.PRECONDITION_FAILED)
          .json({ message: "Resource has been modified" });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error updating user" });
      }
    }
  }

  @Delete(":userId")
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param("userId") userId: string, @Res() response: Response) {
    try {
      const deletedUser = await this.userService.deleteUser(userId);

      if (!deletedUser) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: "User not found" });
      }

      response.json(deletedUser);
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error deleting user" });
    }
  }

  @Get()
  async getUsersWithPagination(
    @Query() query: { page?: number; pageSize?: number },
    @Res() response: Response
  ) {
    try {
      const { page = 1, pageSize = 10 } = query;

      const userDTOs = await this.userService.getUsersWithPagination(
        page,
        pageSize
      );

      response.json(userDTOs);
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error fetching users" });
    }
  }

  @Get("nickname/:userNickname")
  async getUserByNickname(
    @Param("userNickname") userNickname: string,
    @Res() response: Response
  ) {
    try {
      const user = await this.userService.getUserByNickname(userNickname);

      if (!user || user?.deleted_at != null) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: "User not found" });
      }

      const userDataTransferObject = new UserDTO(user);
      response.json(userDataTransferObject);
    } catch (error) {
      console.error(error);
      if (error instanceof UserNotFoundError) {
        response.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error fetching user" });
      }
    }
  }

  @Post("login")
  async loginUser(
    @Body() credentials: { nickname: string; password: string },
    @Res() response: Response
  ) {
    try {
      const { nickname, password } = credentials;

      const token = await this.userService.loginUser(nickname, password);

      if (!token) {
        return response
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: "Authentication failed" });
      }

      response.json({ token });
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error logging in" });
    }
  }

  @Put("update-rating")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateRating(
    @Body() voteInfo: { userId: string; vote: number },
    @Req() request: Request & { user?: JwtUser },
    @Res() response: Response
  ) {
    try {
      const { userId, vote } = voteInfo;
      const voterId = (request.user as JwtUser)?.userId;

      if (!voterId) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          message: "Invalid user authentication data.",
        });
      }

      try {
        await this.userService.updateRating(voterId, userId, vote);
        return response.json({ message: "Vote recorded successfully." });
      } catch (error) {
        if (error instanceof VoterNotFoundError) {
          console.error(error);
          return response.status(HttpStatus.NOT_FOUND).json({
            message: error.message,
          });
        } else if (error instanceof UserToVoteForNotFoundError) {
          console.error(error);
          return response.status(HttpStatus.NOT_FOUND).json({
            message: error.message,
          });
        } else if (error instanceof CannotVoteForYourselfError) {
          console.error(error);
          return response.status(HttpStatus.BAD_REQUEST).json({
            message: error.message,
          });
        } else if (error instanceof VotingRateLimitExceededError) {
          console.error(error);
          return response.status(HttpStatus.BAD_REQUEST).json({
            message: error.message,
          });
        } else if (error instanceof InvalidVoteValueError) {
          console.error(error);
          return response.status(HttpStatus.BAD_REQUEST).json({
            message: error.message,
          });
        }

        console.error(error);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: "Error updating user's rating",
        });
      }
    } catch (error) {
      console.error(error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Error validating request data",
      });
    }
  }