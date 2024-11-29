import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantController } from './controllers/participant.controller';
import { ParticipantService } from './providers/sparticipant.service';
import { ParticipantRepository } from './repositories/participant.repository';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { EventModule } from '../event/event.module';
import { ExportModule } from './export.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
    forwardRef(() => EventModule),
    ExportModule
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService, ParticipantRepository],
  exports: [ParticipantService]
})
export class ParticipantModule {}
