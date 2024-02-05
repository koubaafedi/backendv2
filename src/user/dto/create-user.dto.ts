import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { UserRoleEnum } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(4)
  password: string;
  @IsOptional()
  @IsString()
  bio: string;
  @IsOptional()
  @IsUrl()
  profilePicture: string;
  @IsIn(Object.values(UserRoleEnum))
  role: UserRoleEnum;
}
