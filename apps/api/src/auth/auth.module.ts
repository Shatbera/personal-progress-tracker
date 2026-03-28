import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'topSecret51',
        signOptions: { expiresIn: 3600 },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, UsersRepository],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule { }
