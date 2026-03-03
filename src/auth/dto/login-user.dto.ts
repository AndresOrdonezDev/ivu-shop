import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    password: string;
}