import { IsNotEmpty, IsString, IsNumber, IsDate, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'The ID of the user associated with the event',
    example: '64d1f83bfc13ae1c4b000001', 
    type: String,
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The name of the event',
    example: 'Annual Tech Conference',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A brief description of the event',
    example: 'A gathering of tech enthusiasts to discuss the latest trends.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    description: 'The number of participants expected at the event',
    example: 200,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  participantnbr: number;

  @ApiProperty({
    description: 'The start date and time of the event',
    example: '2024-12-25T10:00:00Z', 
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'The end date and time of the event',
    example: '2024-12-25T18:00:00Z', 
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
