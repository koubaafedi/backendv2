import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsDateString()
  date: Date;
  @IsString()
  location: string;
  @IsOptional()
  @IsUrl()
  picture: string;
  @IsUUID()
  organizerId: string;
}
