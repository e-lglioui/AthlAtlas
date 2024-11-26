import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { EventService } from './providers/event.service';
import { EventController } from './controllers/event.controller';
import { EventRepository } from './repositories/event.repository';
@Module({
    imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
    controllers: [EventController],
    providers: [EventService, EventRepository],
    exports: [EventService],
  })
  export class EventsModule {} 