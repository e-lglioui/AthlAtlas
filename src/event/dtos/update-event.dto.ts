
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  userId?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  participantnbr?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}
