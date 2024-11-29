import { IsOptional, IsNumber, IsDate, IsString, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  participantnbr?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ticketrestant?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}
