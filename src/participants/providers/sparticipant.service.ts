import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { IParticipantService } from '../interfaces/participant.service.interface';
import { ParticipantRepository } from '../repositories/participant.repository';
import { Participant } from '../schemas/participant.schema';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';
import {
  ParticipantAlreadyExistsException,
  EventAlreadyJoinedException,
} from '../exceptions/participant.exception';

@Injectable()
export class ParticipantService implements IParticipantService {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  async createParticipant(
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    const existingParticipant = await this.participantRepository.findByEmail(
      createParticipantDto.email,
    );
    if (existingParticipant) {
      throw new ParticipantAlreadyExistsException(createParticipantDto.email);
    }
    return this.participantRepository.create(createParticipantDto);
  }

  async getAllParticipants(): Promise<Participant[]> {
    return this.participantRepository.findAll();
  }

  async getParticipantById(id: string): Promise<Participant> {
    return this.participantRepository.findById(id);
  }

  async updateParticipant(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    if (updateParticipantDto.email) {
      const existingParticipant = await this.participantRepository.findByEmail(
        updateParticipantDto.email,
      );
      if (existingParticipant && existingParticipant._id.toString() !== id) {
        throw new ParticipantAlreadyExistsException(updateParticipantDto.email);
      }
    }
    return this.participantRepository.update(id, updateParticipantDto);
  }

  async deleteParticipant(id: string): Promise<Participant> {
    return this.participantRepository.delete(id);
  }

  async joinEvent(participantId: string, eventId: string): Promise<Participant> {
    const participant = await this.participantRepository.findById(participantId);
    const eventObjectId = new Types.ObjectId(eventId);
    
    const hasEvent = participant.events.some(
      (id) => id.toString() === eventObjectId.toString()
    );
    
    if (hasEvent) {
      throw new EventAlreadyJoinedException();
    }
    return this.participantRepository.addEvent(participantId, eventId);
  }

  async leaveEvent(participantId: string, eventId: string): Promise<Participant> {
    return this.participantRepository.removeEvent(participantId, eventId);
  }

  async getParticipantsByEventId(eventId: string): Promise<Participant[]> {
    return this.participantRepository.findByEventId(eventId);
  }
}
