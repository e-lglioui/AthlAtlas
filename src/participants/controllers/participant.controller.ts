import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParticipantService } from '../providers/sparticipant.service';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';

@Controller('participants')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createParticipant(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantService.createParticipant(createParticipantDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllParticipants() {
    return this.participantService.getAllParticipants();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getParticipantById(@Param('id') id: string) {
    return this.participantService.getParticipantById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateParticipant(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.participantService.updateParticipant(id, updateParticipantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteParticipant(@Param('id') id: string) {
    return this.participantService.deleteParticipant(id);
  }

  @Post(':id/events/:eventId')
  @HttpCode(HttpStatus.OK)
  async joinEvent(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.participantService.joinEvent(id, eventId);
  }

  @Delete(':id/events/:eventId')
  @HttpCode(HttpStatus.OK)
  async leaveEvent(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    return this.participantService.leaveEvent(id, eventId);
  }
}
