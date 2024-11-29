import { Participant } from '../schemas/participant.schema';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';

export interface IParticipantRepository {
  create(createParticipantDto: CreateParticipantDto): Promise<Participant>;
  findAll(): Promise<Participant[]>;
  findById(id: string): Promise<Participant>;
  findByEmail(email: string): Promise<Participant | null>;
  update(id: string, updateParticipantDto: UpdateParticipantDto): Promise<Participant>;
  delete(id: string): Promise<Participant>;
  
  // Méthodes pour la relation many-to-many
  addEvent(participantId: string, eventId: string): Promise<Participant>;
  removeEvent(participantId: string, eventId: string): Promise<Participant>;
  findByEventId(eventId: string): Promise<Participant[]>;
  findByEventIds(eventIds: string[]): Promise<Participant[]>;
  
  // Méthodes de transaction
  createWithEvent(createParticipantDto: CreateParticipantDto, eventId: string): Promise<Participant>;
  deleteWithEvents(participantId: string): Promise<Participant>;
}
