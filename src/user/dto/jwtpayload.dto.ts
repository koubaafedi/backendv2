import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class JwtPayloadDto extends OmitType(CreateUserDto, ['password']) {}
