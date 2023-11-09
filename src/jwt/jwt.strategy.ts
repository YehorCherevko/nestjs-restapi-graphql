import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { config } from "../config/config";
import { JwtUser } from "../user/interfaces/user-interface";
import { UserService } from "../user/services/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secretKey,
    });
  }

  async validate(payload): Promise<JwtUser> {
    const user = await this.userService.getUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user._id,
      nickname: user.nickname,
      role: user.role,
      rating: user.rating,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      salt: user.salt,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      lastVotedAt: user.lastVotedAt,
    };
  }
}
