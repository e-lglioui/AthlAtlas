import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
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
    const participant = new this.participantModel({
      ...createParticipantDto,
      events: [], // Initialiser un tableau vide pour les événements
    });
    return participant.save();
  }

  async createWithEvent(
    createParticipantDto: CreateParticipantDto, 
    eventId: string,
    session?: ClientSession
  ): Promise<Participant> {
    const participant = new this.participantModel({
      ...createParticipantDto,
      events: [eventId],
    });
    
    if (session) {
      return participant.save({ session });
    }
    return participant.save();
  }

  async findAll(): Promise<Participant[]> {
    return this.participantModel
      .find()
      .populate('events')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Participant> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ParticipantNotFoundException(id);
    }

    const participant = await this.participantModel
      .findById(id)
      .populate('events')
      .exec();
      
    if (!participant) {
      throw new ParticipantNotFoundException(id);
    }
    return participant;
  }

  async findByEmail(email: string): Promise<Participant | null> {
    return this.participantModel
      .findOne({ email })
      .populate('events')
      .exec();
  }

  async update(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ParticipantNotFoundException(id);
      }

      const participant = await this.participantModel
        .findByIdAndUpdate(
          id,
          { $set: updateParticipantDto },
          { 
            new: true,
            runValidators: true,
          }
        )
        .populate('events')
        .exec();
        
      if (!participant) {
        throw new ParticipantNotFoundException(id);
      }

      return participant;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Participant> {
    const participant = await this.participantModel
      .findByIdAndDelete(id)
      .exec();
      
    if (!participant) {
      throw new ParticipantNotFoundException(id);
    }
    return participant;
  }

  async deleteWithEvents(participantId: string): Promise<Participant> {
    const session = await this.participantModel.db.startSession();
    session.startTransaction();

    try {
      const participant = await this.participantModel
        .findByIdAndDelete(participantId)
        .session(session)
        .exec();

      if (!participant) {
        throw new ParticipantNotFoundException(participantId);
      }

      // Ici, vous pouvez ajouter la logique pour mettre à jour les événements si nécessaire

      await session.commitTransaction();
      return participant;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addEvent(participantId: string, eventId: string): Promise<Participant> {
    const participant = await this.participantModel
      .findByIdAndUpdate(
        participantId,
        { $addToSet: { events: eventId } },
        { 
          new: true,
          runValidators: true,
        }
      )
      .populate('events')
      .exec();

    if (!participant) {
      throw new ParticipantNotFoundException(participantId);
    }
    return participant;
  }

  async removeEvent(participantId: string, eventId: string): Promise<Participant> {
    const participant = await this.participantModel
      .findByIdAndUpdate(
        participantId,
        { $pull: { events: eventId } },
        { 
          new: true,
          runValidators: true,
        }
      )
      .populate('events')
      .exec();

    if (!participant) {
      throw new ParticipantNotFoundException(participantId);
    }
    return participant;
  }

  async findByEventId(eventId: string): Promise<Participant[]> {
    return this.participantModel
      .find({ events: eventId })
      .populate('events')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEventIds(eventIds: string[]): Promise<Participant[]> {
    return this.participantModel
      .find({ events: { $in: eventIds } })
      .populate('events')
      .sort({ createdAt: -1 })
      .exec();
  }

  async searchByName(name: string): Promise<Participant[]> {
    const searchRegex = new RegExp(name, 'i'); // 'i' pour une recherche insensible à la casse
    return this.participantModel
      .find({
        $or: [
          { firstName: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } }
        ]
      })
      .populate('events')
      .sort({ createdAt: -1 })
      .exec();
  }
}