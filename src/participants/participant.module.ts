import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantController } from './controllers/participant.controller';
import { ParticipantService } from './providers/sparticipant.service';
import { ParticipantRepository } from './repositories/participant.repository';
import { Participant, ParticipantSchema } from './schemas/participant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService, ParticipantRepository],
  exports: [ParticipantService],
})
export class ParticipantModule {}
