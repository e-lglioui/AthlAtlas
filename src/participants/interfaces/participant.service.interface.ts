import { Participant } from '../schemas/participant.schema';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';

export interface IParticipantService {
  createParticipant(createParticipantDto: CreateParticipantDto): Promise<Participant>;
  getAllParticipants(): Promise<Participant[]>;
  getParticipantById(id: string): Promise<Participant>;
  updateParticipant(id: string, updateParticipantDto: UpdateParticipantDto): Promise<Participant>;
  deleteParticipant(id: string): Promise<Participant>;
  joinEvent(participantId: string, eventId: string): Promise<Participant>;
  leaveEvent(participantId: string, eventId: string): Promise<Participant>;
}
