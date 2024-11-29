import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { IEventRepository } from '../interfaces/event.repository.interface';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { EventNotFoundException } from '../exceptions/event.exception';
@Injectable()
export  class EventRepository implements IEventRepository{
constructor(@InjectModel(Event.name) private readonly eventModel :Model<Event>){}

async   getAllEvents(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }
  async  findByName(name: string): Promise<Event | null>{
    return this.eventModel.findOne({name}).exec();
  }
  async createEvent(createEventDto: CreateEventDto): Promise<Event>{
    const event = new this.eventModel(createEventDto);
    return event.save();
  }
  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
      
    if (!event) {
      throw new EventNotFoundException(id);
    }
    
    return event;
  }
  async  deleteEvent(eventId: string): Promise<Event | null>{
    return this.eventModel.findByIdAndDelete(eventId).exec();
  }
}