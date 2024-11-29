import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ClientSession, Schema, Types } from 'mongoose';
import { ParticipantRepository } from '../repositories/participant.repository';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';
import { Participant } from '../schemas/participant.schema';
import { 
  ParticipantNotFoundException,
  ParticipantAlreadyExistsException 
} from '../exceptions/participant.exception';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    private readonly participantRepository: ParticipantRepository,
  ) {}

  private toObjectId(id: string): Schema.Types.ObjectId {
    try {
      return new Schema.Types.ObjectId(id);
    } catch (error) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }
  }

  async createParticipant(
    createParticipantDto: CreateParticipantDto,
    session?: ClientSession
  ): Promise<Participant> {
    try {
      this.logger.debug(`Creating participant with email: ${createParticipantDto.email}`);

      const existingParticipant = await this.participantRepository.findByEmail(
        createParticipantDto.email
      );

      if (existingParticipant) {
        this.logger.debug(`Found existing participant with email: ${createParticipantDto.email}`);

        if (!createParticipantDto.eventId) {
          return existingParticipant;
        }

        const eventObjectId = this.toObjectId(createParticipantDto.eventId);
        if (existingParticipant.events.some(e => e.toString() === eventObjectId.toString())) {
          throw new ConflictException('Participant already registered for this event');
        }

        return this.participantRepository.addEvent(
          existingParticipant._id.toString(),
          createParticipantDto.eventId
        );
      }

      if (createParticipantDto.eventId) {
        return this.participantRepository.createWithEvent(
          createParticipantDto,
          createParticipantDto.eventId,
          session
        );
      }

      return this.participantRepository.create(createParticipantDto);
    } catch (error) {
      this.logger.error(`Error creating participant: ${error.message}`);
      throw error;
    }
  }

  async getAllParticipants(): Promise<Participant[]> {
    try {
      return await this.participantRepository.findAll();
    } catch (error) {
      this.logger.error(`Error fetching all participants: ${error.message}`);
      throw error;
    }
  }

  async getParticipantById(id: string): Promise<Participant> {
    try {
      const objectId = this.toObjectId(id);
      const participant = await this.participantRepository.findById(objectId.toString());
      if (!participant) {
        throw new ParticipantNotFoundException(id);
      }
      return participant;
    } catch (error) {
      this.logger.error(`Error fetching participant by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async getParticipantsByEventId(eventId: string): Promise<Participant[]> {
    try {
      this.logger.debug(`Fetching participants for event ${eventId}`);
      
      const objectId = new Types.ObjectId(eventId);
      return await this.participantRepository.findByEventId(objectId.toString());
      
    } catch (error) {
      this.logger.error(`Error fetching participants for event ${eventId}: ${error.message}`);
      throw error;
    }
  }

  async getParticipantsByEventIds(eventIds: string[]): Promise<Participant[]> {
    try {
      const objectIds = eventIds.map(id => this.toObjectId(id).toString());
      return await this.participantRepository.findByEventIds(objectIds);
    } catch (error) {
      this.logger.error(`Error fetching participants for events: ${error.message}`);
      throw error;
    }
  }

  async updateParticipant(
    id: string,
    updateParticipantDto: UpdateParticipantDto
  ): Promise<Participant> {
    try {
      const objectId = this.toObjectId(id);
      const participant = await this.participantRepository.update(
        objectId.toString(),
        updateParticipantDto
      );
      if (!participant) {
        throw new ParticipantNotFoundException(id);
      }
      return participant;
    } catch (error) {
      this.logger.error(`Error updating participant ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteParticipant(id: string): Promise<Participant> {
    try {
      const objectId = this.toObjectId(id);
      return await this.participantRepository.deleteWithEvents(objectId.toString());
    } catch (error) {
      this.logger.error(`Error deleting participant ${id}: ${error.message}`);
      throw error;
    }
  }

  async addEventToParticipant(
    participantId: string,
    eventId: string
  ): Promise<Participant> {
    try {
      const participantObjectId = this.toObjectId(participantId);
      const eventObjectId = this.toObjectId(eventId);
      
      const participant = await this.participantRepository.findById(participantObjectId.toString());
      
      if (!participant) {
        throw new ParticipantNotFoundException(participantId);
      }

      if (participant.events.some(e => e.toString() === eventObjectId.toString())) {
        throw new ConflictException('Participant already registered for this event');
      }

      return await this.participantRepository.addEvent(
        participantObjectId.toString(),
        eventObjectId.toString()
      );
    } catch (error) {
      this.logger.error(
        `Error adding event ${eventId} to participant ${participantId}: ${error.message}`
      );
      throw error;
    }
  }

  async removeEventFromParticipant(
    participantId: string,
    eventId: string
  ): Promise<Participant> {
    try {
      const participantObjectId = this.toObjectId(participantId);
      const eventObjectId = this.toObjectId(eventId);
      
      const participant = await this.participantRepository.findById(participantObjectId.toString());
      
      if (!participant) {
        throw new ParticipantNotFoundException(participantId);
      }

      if (!participant.events.some(e => e.toString() === eventObjectId.toString())) {
        throw new NotFoundException('Participant not registered for this event');
      }

      return await this.participantRepository.removeEvent(
        participantObjectId.toString(),
        eventObjectId.toString()
      );
    } catch (error) {
      this.logger.error(
        `Error removing event ${eventId} from participant ${participantId}: ${error.message}`
      );
      throw error;
    }
  }

  async deleteParticipantsByEventId(
    eventId: string,
    session?: ClientSession
  ): Promise<void> {
    try {
      const eventObjectId = this.toObjectId(eventId);
      const participants = await this.participantRepository.findByEventId(eventObjectId.toString());
      
      for (const participant of participants) {
        if (participant.events.length === 1) {
          await this.participantRepository.delete(participant._id.toString());
        } else {
          await this.participantRepository.removeEvent(
            participant._id.toString(),
            eventObjectId.toString()
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting participants for event ${eventId}: ${error.message}`);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const participant = await this.participantRepository.findByEmail(email);
      return !!participant;
    } catch (error) {
      this.logger.error(`Error checking email existence: ${error.message}`);
      throw error;
    }
  }
}
