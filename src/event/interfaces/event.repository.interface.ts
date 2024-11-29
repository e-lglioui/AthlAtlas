import { Event } from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';

export interface IEventRepository {
  getAllEvents(): Promise<Event[]>; 
  findById(id: string): Promise<Event>; 
  findByName(name: string): Promise<Event>; 
  createEvent(createEventDto: CreateEventDto): Promise<Event>; 
  updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event>; 
  deleteEvent(id: string): Promise<Event>; 
}