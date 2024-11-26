import { Controller, Get, Put, Body, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from '../../utils/interceptors/transform.interceptor';
import { ProfileService } from '../providers/profile.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { Profile } from '../schemas/profile.schema';

@ApiTags('profiles')
@Controller('profiles')
@UseInterceptors(TransformInterceptor)
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the profile for the specified user ID.',
    type: Profile,
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.profileService.findProfileByUserId(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'The profile has been successfully updated.',
    type: Profile,
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async updateProfile(@Param('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileService.updateProfile(userId, updateProfileDto);
    return profile;
  }

  @Put(':userId/block')
  @ApiOperation({ summary: 'Update block status by user ID' })
  @ApiResponse({
    status: 200,
    description: 'The block status has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async updateBlockStatus(@Param('userId') userId: string, @Body('isBlocked') isBlocked: boolean) {
    return this.profileService.updateBlockStatus(userId, isBlocked);
  }
}
