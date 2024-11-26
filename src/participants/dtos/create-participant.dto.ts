import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsNumber, Min, Max } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(120)
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;
}
