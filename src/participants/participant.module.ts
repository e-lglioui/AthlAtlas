import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantController } from './controllers/participant.controller';
import { ParticipantService } from './providers/sparticipant.service';
import { ParticipantRepository } from './repositories/participant.repository';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { ExportService } from './services/export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService, ParticipantRepository, ExportService],
  exports: [ParticipantService, ExportService],
})
export class ParticipantModule {}
