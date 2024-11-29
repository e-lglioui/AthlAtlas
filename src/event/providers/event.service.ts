import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { IEventService } from '../interfaces/event.interface';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { 
  EventNotFoundException, 
  EventNameConflictException, 
  InvalidEventDateException, 
} from '../exceptions/event.exception';
import { ExportService } from '../../participants/services/export.service';
import { ParticipantService } from '../../participants/providers/sparticipant.service';
import { Participant } from '../../participants/schemas/participant.schema'; 
import { ExportFormat } from '../../common/enums/export-format.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventService implements IEventService {
  private readonly logger = new Logger(EventService.name);
  private readonly UPLOAD_PATH = 'uploads';

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly exportService: ExportService,
    private readonly participantService: ParticipantService,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH);
    }
  }

  async getAllEvent(): Promise<Event[]> {
    return this.eventRepository.getAllEvents();
  }

  async findById(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }
    return event;
  }

  async findByName(name: string): Promise<Event> {
    const event = await this.eventRepository.findByName(name);
    if (!event) {
      throw new EventNotFoundException(`Event with name '${name}' not found`);
    }
    return event;
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const existingEvent = await this.eventRepository.findByName(createEventDto.name);
  
    if (existingEvent) {
      throw new EventNameConflictException(`Event with name '${createEventDto.name}' already exists`);
    }
  
    if (createEventDto.startDate >= createEventDto.endDate) {
      throw new InvalidEventDateException(
        createEventDto.startDate.toISOString(),
        createEventDto.endDate.toISOString()
      );
    }
  
    return this.eventRepository.createEvent(createEventDto);
  }
  
  async updateEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
  
    if (!event) {
      throw new EventNotFoundException(eventId);
    }
  
    if (
      updateEventDto.startDate &&
      updateEventDto.endDate &&
      updateEventDto.startDate >= updateEventDto.endDate
    ) {
      throw new InvalidEventDateException(
        updateEventDto.startDate.toISOString(),
        updateEventDto.endDate.toISOString()
      );
    }
  
    return this.eventRepository.updateEvent(eventId, updateEventDto);
  }

  async deleteEvent(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    return this.eventRepository.deleteEvent(eventId);
  }

  async exportParticipants(eventId: string, format: ExportFormat): Promise<string> {
    this.logger.debug(`Starting export for event ${eventId} in ${format} format`);

    try {
      // Vérifier si l'événement existe
      const event = await this.findById(eventId);
      if (!event) {
        throw new EventNotFoundException(eventId);
      }

      // Récupérer les participants
      const participants = await this.participantService.getParticipantsByEventId(eventId);
      
      if (!participants || participants.length === 0) {
        this.logger.warn(`No participants found for event ${eventId}`);
        throw new NotFoundException(`No participants found for event ${eventId}`);
      }

      // Exporter les participants dans le format demandé
      const filePath = await this.exportService.exportParticipants(
        participants,
        eventId,
        format
      );

      this.logger.debug(`Export completed successfully: ${filePath}`);
      return filePath;

    } catch (error) {
      this.logger.error(`Export failed for event ${eventId}: ${error.message}`);
      
      // Propager l'erreur avec un message approprié
      if (error instanceof EventNotFoundException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Failed to export participants: ${error.message}`);
    }
  }
  async getEventParticipant(eventId: string): Promise<Participant[]> {  
    const event = await this.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
     return this.participantService.getParticipantsByEventId(eventId);
  }
}
