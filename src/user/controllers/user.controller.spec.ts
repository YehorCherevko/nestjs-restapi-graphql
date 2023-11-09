import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user-repository";
import { CreateUserDto } from "../dto/create-user-dto";
import { UserRole } from "../enums/user-roles";

const userRepositoryMock = {
  createUser: jest.fn(),
  getUserByNickname: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //createUser
  it("should create a new user", async () => {
    const createUserDto: CreateUserDto = {
      nickname: "testuser",
      firstName: "Test",
      lastName: "User",
      password: "testpassword",
      role: UserRole.User,
    };

    const expectedResult: CreateUserDto = {
      ...createUserDto,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      deleted_at: null,
      salt: expect.any(String),
      rating: 0,
      lastVotedAt: null,
      password: expect.any(String),
    };

    userRepositoryMock.getUserByNickname.mockResolvedValue(null);
    userRepositoryMock.createUser.mockResolvedValue(expectedResult);

    const result = await userService.createUser(createUserDto);

    expect(userRepositoryMock.getUserByNickname).toHaveBeenCalledWith(
      createUserDto.nickname
    );
    expect(userRepositoryMock.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: createUserDto.nickname,
        password: expect.any(String),
      })
    );
    expect(result).toEqual(expectedResult);
  });

  //getUserByNickname
  it("should get a user by nickname", async () => {
    const nickname = "testuser";
    const expectedUser = {
      nickname,
      firstName: "Test",
      lastName: "User",
      role: UserRole.User,
    };

    userRepositoryMock.getUserByNickname.mockResolvedValue(expectedUser);

    const result = await userService.getUserByNickname(nickname);

    expect(userRepositoryMock.getUserByNickname).toHaveBeenCalledWith(nickname);
    expect(result).toEqual(expectedUser);
  });

  //updateUser
  it("should update user information", async () => {
    const userId = "testuser";
    const updatedUserDto = {
      firstName: "Updated",
      lastName: "Info",
    };

    const existingUser = {
      id: userId,
      firstName: "Test",
      lastName: "User",
      role: UserRole.User,
    };

    const updatedUser = {
      ...existingUser,
      ...updatedUserDto,
      updated_at: new Date(),
    };

    const ifUnmodifiedSince = "2023-01-01T00:00:00.000Z";

    userRepositoryMock.getUserById.mockResolvedValue(existingUser);
    userRepositoryMock.updateUser.mockResolvedValue(updatedUser);

    const result = await userService.updateUser(
      userId,
      updatedUserDto,
      ifUnmodifiedSince
    );

    expect(userRepositoryMock.getUserById).toHaveBeenCalledWith(userId);
    expect(userRepositoryMock.updateUser).toHaveBeenCalledWith(
      userId,
      updatedUserDto
    );
    expect(result).toEqual(updatedUser);
  });
});
