import { IsString, IsEmail, IsOptional, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty({
    description: 'Le prénom du participant',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Le nom du participant',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'L\'email du participant',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Le numéro de téléphone du participant',
    example: '+33612345678'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Le numéro de téléphone doit être au format international'
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'L\'ID de l\'événement auquel le participant s\'inscrit',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'L\'ID de l\'événement doit être un ObjectId MongoDB valide'
  })
  eventId?: string;
}
