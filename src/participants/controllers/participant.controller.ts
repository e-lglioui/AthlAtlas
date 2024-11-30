import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { ParticipantService } from '../providers/sparticipant.service';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Participant } from '../schemas/participant.schema';
import { Types } from 'mongoose';

@ApiTags('Participants')
@Controller('participants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParticipantController {
  private readonly logger = new Logger(ParticipantController.name);

  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new participant' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Participant successfully created',
    type: Participant 
  })
  async createParticipant(
    @Body() createParticipantDto: CreateParticipantDto
  ): Promise<Participant> {
    try {
      return await this.participantService.createParticipant(createParticipantDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all participants' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of all participants',
    type: [Participant] 
  })
  async getAllParticipants(): Promise<Participant[]> {
    return this.participantService.getAllParticipants();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get participant by ID' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Participant found',
    type: Participant 
  })
  async getParticipantById(@Param('id') id: string): Promise<Participant> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid participant ID');
    }
    return this.participantService.getParticipantById(id);
  }

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get participants by event ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of participants for the event',
    type: [Participant] 
  })
  async getParticipantsByEventId(
    @Param('eventId') eventId: string
  ): Promise<Participant[]> {
    return this.participantService.getParticipantsByEventId(eventId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update participant' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Participant updated',
    type: Participant 
  })
  async updateParticipant(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto
  ): Promise<Participant> {
    try {
      if (!id) {
        throw new BadRequestException('Participant ID is required');
      }
      
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid participant ID format');
      }

      const updatedParticipant = await this.participantService.updateParticipant(
        id, 
        updateParticipantDto
      );

      if (!updatedParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return updatedParticipant;
    } catch (error) {
      this.logger.error(`Error updating participant ${id}: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete participant' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Participant deleted',
    type: Participant 
  })
  async deleteParticipant(@Param('id') id: string): Promise<Participant> {
    return this.participantService.deleteParticipant(id);
  }

  @Post(':id/events/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add participant to event' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Participant added to event',
    type: Participant 
  })
  async addEventToParticipant(
    @Param('id') id: string,
    @Param('eventId') eventId: string
  ): Promise<Participant> {
    return this.participantService.addEventToParticipant(id, eventId);
  }

  @Delete(':id/events/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove participant from event' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Participant removed from event',
    type: Participant 
  })
  async removeEventFromParticipant(
    @Param('id') id: string,
    @Param('eventId') eventId: string
  ): Promise<Participant> {
    return this.participantService.removeEventFromParticipant(id, eventId);
  }

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if email exists' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Email check result',
    type: Boolean 
  })
  async checkEmailExists(@Query('email') email: string): Promise<boolean> {
    return this.participantService.checkEmailExists(email);
  }

  @Get('search/name')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search participants by name' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of participants matching the search criteria',
    type: [Participant] 
  })
  async searchParticipantsByName(
    @Query('q') query: string
  ): Promise<Participant[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }
    return this.participantService.searchByName(query);
  }
}