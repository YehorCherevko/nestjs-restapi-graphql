import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { UserModule } from "../user/modules/user.module";
import { UserGraphqlModule } from "../graphql/user-graphql.module";
import { config } from "src/config/config";

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUri, {}),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    UserGraphqlModule,
    UserModule,
  ],
})
export class AppModule {}
