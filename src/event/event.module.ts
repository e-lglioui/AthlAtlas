import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { Event, EventSchema } from './schemas/event.schema';
import { EventRepository } from './repositories/event.repository';
import { ParticipantModule } from '../participants/participant.module';
import { ExportModule } from '../participants/export.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ]),
    forwardRef(() => ParticipantModule),
    ExportModule
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService]
})
export class EventModule {} 