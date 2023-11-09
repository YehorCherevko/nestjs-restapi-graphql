import { NestFactory } from "@nestjs/core";
import { config } from "./config/config";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";

async function start() {
  const PORT = config.port;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

start();
