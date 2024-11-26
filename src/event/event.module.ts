import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { EventRepository } from './repositories/event.repository';
import { Event, EventSchema } from './schemas/event.schema';
import { ParticipantModule } from '../participants/participant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
    ]),
    ParticipantModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {} 