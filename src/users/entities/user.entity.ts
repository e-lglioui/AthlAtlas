import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
    minLength: 3,
    maxLength: 30,
  })
  username: string;

  @Expose()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
    format: 'email',
  })
  email: string;

  @Exclude()
  password: string;

  @Expose({ groups: ['profile', 'admin'] })
  @ApiProperty({
    description: 'User status information (profile and admin only)',
    example: {
      online: true,
      lastSeen: '2024-01-20T12:00:00Z',
    },
    type: 'object',
    properties: {
      online: {
        type: 'boolean',
        description: 'Whether the user is currently online',
      },
      lastSeen: {
        type: 'string',
        format: 'date-time',
        description: 'Last time the user was active',
      },
    },
  })
  status: {
    online: boolean;
    lastSeen: Date;
  };

  @Expose({ groups: ['admin'] })
  @ApiProperty({
    description: 'Account status information (admin only)',
    example: {
      isBlocked: false,
      blockedReason: null,
    },
    type: 'object',
    properties: {
      isBlocked: {
        type: 'boolean',
        description: 'Whether the user account is blocked',
      },
      blockedReason: {
        type: 'string',
        description: 'Reason for account block if applicable',
        nullable: true,
      },
    },
  })
  accountStatus: {
    isBlocked: boolean;
    blockedReason?: string;
  };

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
