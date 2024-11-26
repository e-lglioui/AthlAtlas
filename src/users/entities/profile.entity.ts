import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileEntity {
  @Expose()
  @ApiProperty({ example: 'I am a software engineer' })
  bio?: string;

  @Expose()
  @ApiProperty({ example: 'https://example.com/avatar.png' })
  avatar?: string;

  @Expose()
  @ApiProperty({ example: 'light', enum: ['light', 'dark'] })
  theme: string;

  @Expose()
  @ApiProperty({ example: false })
  isBlocked: boolean;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-20T12:00:00Z' })
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-20T12:00:00Z' })
  updatedAt: Date;

  constructor(partial: Partial<ProfileEntity>) {
    Object.assign(this, partial);
  }
}
