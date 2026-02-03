import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy],
    exports: [AuthService, JwtStrategy],
})
export class AuthModule { }
