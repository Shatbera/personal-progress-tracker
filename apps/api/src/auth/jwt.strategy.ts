import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersRepository } from "./users.repository";
import { JwtPayload } from "./jwt-payload.interface";
import { User } from "./user.entity";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly configService: ConfigService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET') || 'topSecret51';
        super({
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    public async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}