import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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
      const userWithoutPassword = { ...user, password: undefined };

      return userWithoutPassword;
    } catch (error) {
      this.handlerDBException(error)
    }
  }

  async login(loginDto: LoginUserDto) {
    const { password, email } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select:['email', 'password',]
    })
    if (!user) throw new BadRequestException('user not found');
    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('invalid password');
    const userWithoutPassword = { ...user, password: undefined };
    return userWithoutPassword;
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
