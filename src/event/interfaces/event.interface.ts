import {Event} from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';

 export interface IEventService {
getAllEvent(): Promise<Event[]>;
findById(eventId: string): Promise<Event>;
findByName(name: string): Promise<Event>;
createEvent(CreateEventDto: CreateEventDto): Promise<Event>;
updateEvent(eventId: string, UpdateEventDto: UpdateEventDto): Promise<Event>;
deleteEvent(eventId: string): Promise<Event>
exportParticipants(eventId: string): Promise<string> 
 }