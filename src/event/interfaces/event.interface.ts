import {Event} from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { Participant } from '../../participants/schemas/participant.schema';
import { ExportFormat } from '../../common/enums/export-format.enum';

export interface IEventService {
getAllEvent(): Promise<Event[]>;
findById(eventId: string): Promise<Event>;
findByName(name: string): Promise<Event>;
createEvent(createEventDto: CreateEventDto): Promise<Event>;
updateEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<Event>;
deleteEvent(eventId: string): Promise<Event>;
exportParticipants(eventId: string, format: ExportFormat): Promise<string>;
getEventParticipants(eventId: string): Promise<Participant[]>;
}