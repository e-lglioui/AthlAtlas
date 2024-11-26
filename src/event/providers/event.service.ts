import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class EventService implements IEventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly exportService: ExportService,
    private readonly participantService: ParticipantService,
  ) {}

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

  async exportParticipants(eventId: string): Promise<string> {
    const event = await this.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Récupérer tous les participants de l'événement
    const participants = await this.participantService.getParticipantsByEventId(eventId);
    
    // Générer le fichier CSV
    return this.exportService.exportParticipantsToCSV(participants, eventId);
  }
}
