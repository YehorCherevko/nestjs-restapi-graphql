import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app/app.module";
import { HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "../src/user/dto/create-user-dto";
import { UserDTO } from "../src/user/dto/user-dto";
import { UserRole } from "../src/user/enums/user-roles";

describe("AppController (e2e)", () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser: CreateUserDto = {
    nickname: "nick23874262434775783578682",
    firstName: "name",
    lastName: "surname",
    password: "password12fsdfs3",
    role: UserRole.Admin,
  };

  let authToken: string;

  it("should create a user", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/users")
      .send(testUser)
      .expect(HttpStatus.CREATED);

    const user: UserDTO = response.body;
    expect(user).toBeDefined();
    expect(user.nickname).toEqual(testUser.nickname);
  });

  it("should get a user by ID", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/users/nickname/${testUser.nickname}`)
      .expect(HttpStatus.OK);

    const user: UserDTO = response.body;
    expect(user).toBeDefined();
    expect(user.nickname).toEqual(testUser.nickname);
  });

  it("should get user profile with JWT token", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/users/nickname/" + testUser.nickname)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    const user: UserDTO = response.body;
    expect(user).toBeDefined();
    expect(user.nickname).toEqual(testUser.nickname);
  });
});
