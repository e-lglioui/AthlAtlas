import { IsOptional, IsNumber, IsDate, IsString, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'URL de l\'image de l\'événement',
    example: 'https://example.com/images/event.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'L\'URL de l\'image doit être valide' })
  image?: string;
}
