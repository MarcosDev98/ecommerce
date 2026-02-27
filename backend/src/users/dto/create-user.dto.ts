import {
  IsEmail,
  IsString,
  IsInt,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  @IsOptional()
  age?: number;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
