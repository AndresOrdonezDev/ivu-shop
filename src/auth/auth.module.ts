import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/users.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
    // --> to config in mode no async
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions:{
    //     expiresIn:'2h'
    //   }
    // })
  ],
  exports:[TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule { }
