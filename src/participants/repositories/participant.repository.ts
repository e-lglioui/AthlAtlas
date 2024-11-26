import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../schemas/participant.schema';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';
import { IParticipantRepository } from '../interfaces/participant.repository.interface';
import { ParticipantNotFoundException } from '../exceptions/participant.exception';

@Injectable()
export class ParticipantRepository implements IParticipantRepository {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) {}

  async create(createParticipantDto: CreateParticipantDto): Promise<Participant> {
    const participant = new this.participantModel(createParticipantDto);
    return participant.save();
  }

  async findAll(): Promise<Participant[]> {
    return this.participantModel.find().populate('events').exec();
  }

  async findById(id: string): Promise<Participant> {
    const participant = await this.participantModel
      .findById(id)
      .populate('events')
      .exec();
    if (!participant) {
      throw new ParticipantNotFoundException(id);
    }
    return participant;
  }

  async findByEmail(email: string): Promise<Participant> {
    return this.participantModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    const participant = await this.participantModel
      .findByIdAndUpdate(id, updateParticipantDto, { new: true })
      .exec();
    if (!participant) {
      throw new ParticipantNotFoundException(id);
    }
    return participant;
  }

  async delete(id: string): Promise<Participant> {
    const participant = await this.participantModel.findByIdAndDelete(id).exec();
    if (!participant) {
      throw new ParticipantNotFoundException(id);
    }
    return participant;
  }

  async addEvent(participantId: string, eventId: string): Promise<Participant> {
    return this.participantModel
      .findByIdAndUpdate(
        participantId,
        { $addToSet: { events: eventId } },
        { new: true },
      )
      .populate('events')
      .exec();
  }

  async removeEvent(participantId: string, eventId: string): Promise<Participant> {
    return this.participantModel
      .findByIdAndUpdate(
        participantId,
        { $pull: { events: eventId } },
        { new: true },
      )
      .populate('events')
      .exec();
  }
}
