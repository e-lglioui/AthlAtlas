import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantService } from './sparticipant.service';
import { ParticipantRepository } from '../repositories/participant.repository';
import { EventService } from '../../event/providers/event.service';
import { Participant } from '../schemas/participant.schema';
import { Types } from 'mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ParticipantNotFoundException } from '../exceptions/participant.exception';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let repository: jest.Mocked<ParticipantRepository>;
  let eventService: jest.Mocked<EventService>;

  const mockParticipant = {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    organization: 'Test Org',
    age: 25,
    gender: 'male',
    events: [new Types.ObjectId()],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Participant;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        {
          provide: ParticipantRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            createWithEvent: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteWithEvents: jest.fn(),
            addEvent: jest.fn(),
            removeEvent: jest.fn(),
            findByEventId: jest.fn(),
            findByEventIds: jest.fn(),
            searchByName: jest.fn(),
          },
        },
        {
          provide: EventService,
          useValue: {
            updateTicketsCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    repository = module.get(ParticipantRepository);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createParticipant', () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      organization: 'Test Org',
      age: 25,
      gender: 'male',
      eventId: new Types.ObjectId().toString(),
    };

    it('should create a new participant with event', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.createWithEvent.mockResolvedValue(mockParticipant);
      eventService.updateTicketsCount.mockResolvedValue();

      const result = await service.createParticipant(createDto);

      expect(result).toEqual(mockParticipant);
      expect(repository.createWithEvent).toHaveBeenCalled();
      expect(eventService.updateTicketsCount).toHaveBeenCalled();
    });

    it('should handle existing participant registration', async () => {
      repository.findByEmail.mockResolvedValue(mockParticipant);
      repository.addEvent.mockResolvedValue({
        ...mockParticipant,
        events: [...mockParticipant.events, new Types.ObjectId(createDto.eventId)],
      } as Participant);

      const result = await service.createParticipant(createDto);

      expect(result.events).toHaveLength(2);
      expect(repository.addEvent).toHaveBeenCalled();
    });

    it('should throw ConflictException if participant already registered for event', async () => {
      const existingParticipant = {
        ...mockParticipant,
        events: [new Types.ObjectId(createDto.eventId)],
      } as Participant;

      repository.findByEmail.mockResolvedValue(existingParticipant);
      eventService.updateTicketsCount.mockRejectedValue(new ConflictException());

      await expect(service.createParticipant(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getParticipantById', () => {
    it('should return a participant by id', async () => {
      repository.findById.mockResolvedValue(mockParticipant);

      const result = await service.getParticipantById(
        mockParticipant._id.toString(),
      );

      expect(result).toEqual(mockParticipant);
      expect(repository.findById).toHaveBeenCalledWith(
        mockParticipant._id.toString(),
      );
    });

    it('should throw NotFoundException if participant not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getParticipantById(mockParticipant._id.toString()),
      ).rejects.toThrow(ParticipantNotFoundException);
    });
  });

  describe('addEventToParticipant', () => {
    it('should add event to participant', async () => {
      const updatedParticipant = {
        ...mockParticipant,
        events: [...mockParticipant.events, new Types.ObjectId()],
      } as Participant;

      repository.addEvent.mockResolvedValue(updatedParticipant);
      eventService.updateTicketsCount.mockResolvedValue();

      const result = await service.addEventToParticipant(
        mockParticipant._id.toString(),
        'new-event-id',
      );

      expect(result).toEqual(updatedParticipant);
      expect(repository.addEvent).toHaveBeenCalled();
      expect(eventService.updateTicketsCount).toHaveBeenCalled();
    });
  });

  describe('removeEventFromParticipant', () => {
    it('should remove event from participant', async () => {
      const updatedParticipant = {
        ...mockParticipant,
        events: [],
      } as Participant;

      repository.removeEvent.mockResolvedValue(updatedParticipant);
      eventService.updateTicketsCount.mockResolvedValue();

      const result = await service.removeEventFromParticipant(
        mockParticipant._id.toString(),
        mockParticipant.events[0].toString(),
      );

      expect(result).toEqual(updatedParticipant);
      expect(repository.removeEvent).toHaveBeenCalled();
      expect(eventService.updateTicketsCount).toHaveBeenCalled();
    });
  });

  describe('searchByName', () => {
    it('should return participants matching the search name', async () => {
      const participants = [mockParticipant];
      repository.searchByName.mockResolvedValue(participants);

      const result = await service.searchByName('John');

      expect(result).toEqual(participants);
      expect(repository.searchByName).toHaveBeenCalledWith('John');
    });
  });
}); 