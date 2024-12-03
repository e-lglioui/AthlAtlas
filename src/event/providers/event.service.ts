import { Injectable, NotFoundException, Logger, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { IEventService } from '../interfaces/event.interface';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { CreateParticipantDto } from '../../participants/dtos/create-participant.dto';
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
import { EventStatsDto } from '../dtos/event-stats.dto';
import { Types } from 'mongoose';

@Injectable()
export class EventService implements IEventService {
  private readonly logger = new Logger(EventService.name);
  private readonly UPLOAD_PATH = 'uploads';

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly exportService: ExportService,
    @Inject(forwardRef(() => ParticipantService))
    private readonly participantService: ParticipantService
  ) {
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
  async getEventParticipants(eventId: string): Promise<Participant[]> {
    this.logger.debug(`Fetching participants for event ${eventId}`);
    
    const event = await this.findById(eventId);
    if (!event) {
      this.logger.error(`Event with ID ${eventId} not found`);
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    
    const participants = await this.participantService.getParticipantsByEventId(eventId);
    this.logger.debug(`Found ${participants.length} participants for event ${eventId}`);
    
    return participants;
  }

  async updateTicketsCount(eventId: string): Promise<void> {
    try {
      this.logger.debug(`Updating tickets count for event ${eventId}`);
      
      const event = await this.findById(eventId);
      if (!event) {
        throw new EventNotFoundException(eventId);
      }

      // Obtenir le nombre de participants pour cet événement
      const participants = await this.participantService.getParticipantsByEventId(eventId);
      const participantCount = participants.length;

      this.logger.debug(`Found ${participantCount} participants for event ${eventId}`);
      this.logger.debug(`Original tickets: ${event.participantnbr}, Remaining: ${event.ticketrestant}`);

      // Calculer le nouveau nombre de tickets restants
      const newTicketCount = event.participantnbr - participantCount;

      // Mettre à jour l'événement avec le nouveau nombre de tickets
      const updateDto: UpdateEventDto = {
        ticketrestant: newTicketCount
      };

      await this.eventRepository.updateEvent(eventId, updateDto);

      this.logger.debug(`Updated tickets remaining to: ${newTicketCount}`);
    } catch (error) {
      this.logger.error(`Error updating tickets count: ${error.message}`);
      throw error;
    }
  }

  // Modifier la méthode qui gère l'ajout d'un participant
  async addParticipant(eventId: string, participantDto: CreateParticipantDto): Promise<void> {
    const event = await this.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    // Vérifier s'il reste des tickets
    if (event.ticketrestant <= 0) {
      throw new Error('No more tickets available for this event');
    }

    try {
      // Ajouter le participant
      await this.participantService.createParticipant({
        ...participantDto,
        eventId: eventId
      });

      // Mettre à jour le nombre de tickets restants
      await this.updateTicketsCount(eventId);
    } catch (error) {
      this.logger.error(`Error adding participant to event: ${error.message}`);
      throw error;
    }
  }

  async getEventStatistics(): Promise<EventStatsDto> {
    try {
      const now = new Date();
      const allEvents = await this.eventRepository.getAllEvents();
      
      // Calculer les statistiques de base
      const activeEvents = allEvents.filter(event => 
        event.startDate <= now && event.endDate >= now
      );
      
      const completedEvents = allEvents.filter(event => 
        event.endDate < now
      );
      
      const upcomingEvents = allEvents.filter(event => 
        event.startDate > now
      );

      // Calculer les statistiques de tickets
      let totalTickets = 0;
      let soldTickets = 0;
      const participationTrends = [];

      for (const event of allEvents) {
        totalTickets += event.participantnbr;
        const participants = await this.participantService.getParticipantsByEventId(event._id.toString());
        const eventSoldTickets = participants.length;
        soldTickets += eventSoldTickets;

        participationTrends.push({
          eventId: event._id.toString(),
          eventName: event.name,
          totalTickets: event.participantnbr,
          soldTickets: eventSoldTickets,
          remainingTickets: event.ticketrestant
        });
      }

      // Grouper les événements par mois
      const eventsByMonth = allEvents.reduce((acc, event) => {
        const month = event.startDate.toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        completedEvents: completedEvents.length,
        upcomingEvents: upcomingEvents.length,
        totalParticipants: soldTickets,
        averageParticipantsPerEvent: allEvents.length ? soldTickets / allEvents.length : 0,
        ticketUtilization: {
          totalTickets,
          soldTickets,
          utilizationRate: totalTickets ? (soldTickets / totalTickets) * 100 : 0
        },
        eventsByMonth,
        participationTrends
      };
    } catch (error) {
      this.logger.error(`Error getting event statistics: ${error.message}`);
      throw error;
    }
  }

  async getEventsByUserId(userId: string): Promise<Event[]> {
    try {
      this.logger.debug(`Fetching events for user ${userId}`);
      
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const events = await this.eventRepository.findByUserId(userId);
      
      this.logger.debug(`Found ${events.length} events for user ${userId}`);
      
      return events;
    } catch (error) {
      this.logger.error(`Error fetching events for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
