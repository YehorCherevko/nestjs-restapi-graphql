import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app/app.module";

describe("UserController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/api/users/:userId (PUT) should update user information", async () => {
    const userId = "652d3bfe8d8d83a78c7487c4";

    const updatedUserDto = {
      firstName: "Updated",
      lastName: "Info",
    };

    const response = await request(app.getHttpServer())
      .put(`/api/users/${userId}`)
      .send(updatedUserDto)
      .expect(200);

    const updatedUser = response.body;

    expect(updatedUser.firstName).toEqual(updatedUserDto.firstName);
    expect(updatedUser.lastName).toEqual(updatedUserDto.lastName);
  });

  afterAll(async () => {
    await app.close();
  });
});
