import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { ClientSession, Schema, Types } from 'mongoose';
import { ParticipantRepository } from '../repositories/participant.repository';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';
import { Participant } from '../schemas/participant.schema';
import { 
  ParticipantNotFoundException,
} from '../exceptions/participant.exception';
import { EventService } from '../../event/providers/event.service';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    private readonly participantRepository: ParticipantRepository,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService
  ) {}

  private toObjectId(id: string): Schema.Types.ObjectId {
    try {
      return new Schema.Types.ObjectId(id);
    } catch  {
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

      let result: Participant;

      if (existingParticipant) {
        this.logger.debug(`Found existing participant with email: ${createParticipantDto.email}`);

        if (!createParticipantDto.eventId) {
          return existingParticipant;
        }

        const eventObjectId = this.toObjectId(createParticipantDto.eventId);
        if (existingParticipant.events.some(e => e.toString() === eventObjectId.toString())) {
          throw new ConflictException('Participant already registered for this event');
        }

        result = await this.participantRepository.addEvent(
          existingParticipant._id.toString(),
          createParticipantDto.eventId
        );
      } else {
        if (createParticipantDto.eventId) {
          result = await this.participantRepository.createWithEvent(
            createParticipantDto,
            createParticipantDto.eventId,
            session
          );
        } else {
          result = await this.participantRepository.create(createParticipantDto);
        }
      }

      // Mettre à jour le nombre de tickets si un eventId est fourni
      if (createParticipantDto.eventId) {
        await this.eventService.updateTicketsCount(createParticipantDto.eventId);
      }

      return result;
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
      if (!id || !Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`Invalid participant ID format`);
      }

      const participant = await this.participantRepository.findById(id);
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
      this.logger.debug(`Updating participant ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid participant ID');
      }

      const existingParticipant = await this.participantRepository.findById(id);
      if (!existingParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      const updatedParticipant = await this.participantRepository.update(
        id,
        updateParticipantDto
      );

      this.logger.debug(`Successfully updated participant ${id}`);
      return updatedParticipant;
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
      const result = await this.participantRepository.addEvent(participantId, eventId);
      // Mettre à jour le nombre de tickets restants
      await this.eventService.updateTicketsCount(eventId);
      return result;
    } catch (error) {
      this.logger.error(`Error adding event ${eventId} to participant ${participantId}: ${error.message}`);
      throw error;
    }
  }

  async removeEventFromParticipant(
    participantId: string,
    eventId: string
  ): Promise<Participant> {
    try {
      const result = await this.participantRepository.removeEvent(participantId, eventId);
      // Mettre à jour le nombre de tickets restants
      await this.eventService.updateTicketsCount(eventId);
      return result;
    } catch (error) {
      this.logger.error(`Error removing event ${eventId} from participant ${participantId}: ${error.message}`);
      throw error;
    }
  }

  async deleteParticipantsByEventId(
    eventId: string,
  
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

  async searchByName(name: string): Promise<Participant[]> {
    try {
      this.logger.debug(`Searching participants with name: ${name}`);
      const participants = await this.participantRepository.searchByName(name);
      this.logger.debug(`Found ${participants.length} participants matching name: ${name}`);
      return participants;
    } catch (error) {
      this.logger.error(`Error searching participants by name: ${error.message}`);
      throw error;
    }
  }
}