import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/users.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...userData } = createAuthDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user)
      //return user without password
      const { password: _, ...userWithoutPassword } = user;
      const token = this.getJwtToken({id: user.id});
      return {
        ...userWithoutPassword,
        token
      };
    } catch (error) {
      this.handlerDBException(error)
    }
  }

  async login(loginDto: LoginUserDto) {
    const { password, email } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select:{id: true,email: true, password: true }
    })

    if (!user) throw new BadRequestException('user not found');
    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('invalid password');
    const token = this.getJwtToken({id: user.id});
    return {
      id:user.id,
      token
    };
  }

  private getJwtToken(payload:JwtPayload):string{
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handlerDBException(error: any): never {
    // unique constraint
    if (error.code === '23505') {
      throw new BadRequestException('Ya existe un registro con ese email');
    }
    // NOT NULL constraint
    if (error.code === '23502') {
      throw new BadRequestException(error.message);
    }
    throw new InternalServerErrorException('Error en el servidor' + error.message)
  }
}
