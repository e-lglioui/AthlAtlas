import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from '../repositories/event.repository';
import { ParticipantService } from '../../participants/providers/sparticipant.service';
import { Event } from '../schemas/event.schema';
import { Participant } from '../../participants/schemas/participant.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { 
  EventNotFoundException, 
  EventNameConflictException, 
  InvalidEventDateException 
} from '../exceptions/event.exception';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('EventService', () => {
  let service: EventService;
  let repository: jest.Mocked<EventRepository>;
  let participantService: jest.Mocked<ParticipantService>;

  const mockEvent = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    name: 'Test Event',
    bio: 'Test Bio',
    participantnbr: 100,
    prix: 50,
    ticketrestant: 50,
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    $assertPopulated: jest.fn(),
    $clearModifiedPaths: jest.fn(),
    $clone: jest.fn(),
    $createModifiedPathsSnapshot: jest.fn(),
    $getAllSubdocs: jest.fn(),
    $ignore: jest.fn(),
    $isDefault: jest.fn(),
    $isDeleted: jest.fn(),
    $isEmpty: jest.fn(),
    $isValid: jest.fn(),
    $locals: {},
    $markValid: jest.fn(),
    $model: jest.fn(),
    $op: null,
    $parent: jest.fn(),
    $session: jest.fn(),
    $set: jest.fn(),
    $toObject: jest.fn(),
    $where: jest.fn(),
    collection: {},
    db: {},
    errors: {},
    isNew: false,
    schema: {},
  } as unknown as Event;

  const mockCreateEventDto: CreateEventDto = {
    userId: '64d1f83bfc13ae1c4b000002',
    name: 'New Event',
    bio: 'New Description',
    participantnbr: 50,
    prix: 75,
    startDate: new Date('2024-12-25'),
    endDate: new Date('2024-12-26'),
  };

  const mockUpdateEventDto: UpdateEventDto = {
    name: 'Updated Event',
    bio: 'Updated Description',
    participantnbr: 75,
    ticketrestant: 75,
    startDate: new Date('2024-12-25'),
    endDate: new Date('2024-12-26'),
  };

  const mockParticipants = [
    {
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
      $assertPopulated: jest.fn(),
      $clearModifiedPaths: jest.fn(),
      $clone: jest.fn(),
      $createModifiedPathsSnapshot: jest.fn(),
    } as unknown as Participant,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: {
            getAllEvents: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            createEvent: jest.fn(),
            updateEvent: jest.fn(),
            deleteEvent: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
        {
          provide: ParticipantService,
          useValue: {
            getParticipantsByEventId: jest.fn(),
            deleteParticipantsByEventId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get(EventRepository);
    participantService = module.get(ParticipantService);
  });

  describe('getAllEvent', () => {
    it('should return all events', async () => {
      repository.getAllEvents.mockResolvedValue([mockEvent]);
      const result = await service.getAllEvent();
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findById', () => {
    it('should return an event by id', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      const result = await service.findById(mockEvent._id.toString());
      expect(result).toEqual(mockEvent);
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent-id')).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return an event by name', async () => {
      repository.findByName.mockResolvedValue(mockEvent);
      const result = await service.findByName('Test Event');
      expect(result).toEqual(mockEvent);
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findByName.mockResolvedValue(null);
      await expect(service.findByName('Nonexistent Event')).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.createEvent.mockResolvedValue(mockEvent);
      const result = await service.createEvent(mockCreateEventDto);
      expect(result).toEqual(mockEvent);
    });

    it('should throw EventNameConflictException when event name exists', async () => {
      repository.findByName.mockResolvedValue(mockEvent);
      await expect(service.createEvent(mockCreateEventDto)).rejects.toThrow(EventNameConflictException);
    });

    it('should throw InvalidEventDateException when end date is before start date', async () => {
      const invalidDto = {
        ...mockCreateEventDto,
        startDate: new Date('2024-12-26'),
        endDate: new Date('2024-12-25'),
      };
      await expect(service.createEvent(invalidDto)).rejects.toThrow(InvalidEventDateException);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const mockUpdateEventDto = {
        name: 'Updated Event',
        bio: 'Updated Bio',
        participantnbr: 75,
        ticketrestant: 75,
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-26'),
      };

      repository.findById.mockResolvedValue(mockEvent);
      repository.updateEvent.mockResolvedValue({ 
        ...mockEvent, 
        ...mockUpdateEventDto 
      } as Event);

      const result = await service.updateEvent(mockEvent._id.toString(), mockUpdateEventDto);
      expect(result).toBeDefined();
      expect(repository.updateEvent).toHaveBeenCalled();
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.updateEvent('nonexistent-id', mockUpdateEventDto)).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      repository.deleteEvent.mockResolvedValue(mockEvent);
      participantService.deleteParticipantsByEventId.mockResolvedValue();
      const result = await service.deleteEvent(mockEvent._id.toString());
      expect(result).toEqual(mockEvent);
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.deleteEvent('nonexistent-id')).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('getEventParticipants', () => {
    it('should return participants for an event', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      participantService.getParticipantsByEventId.mockResolvedValue(mockParticipants);
      const result = await service.getEventParticipants(mockEvent._id.toString());
      expect(result).toEqual(mockParticipants);
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.getEventParticipants('nonexistent-id')).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('getEventsByUserId', () => {
    it('should return events for a user', async () => {
      repository.findByUserId.mockResolvedValue([mockEvent]);
      const result = await service.getEventsByUserId(mockEvent.userId.toString());
      expect(result).toEqual([mockEvent]);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.getEventsByUserId('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTicketsCount', () => {
    it('should update tickets count', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      participantService.getParticipantsByEventId.mockResolvedValue([]);
      repository.updateEvent.mockResolvedValue({ 
        ...mockEvent, 
        ticketrestant: mockEvent.participantnbr 
      } as Event);

      await service.updateTicketsCount(mockEvent._id.toString());
      
      expect(repository.findById).toHaveBeenCalled();
      expect(participantService.getParticipantsByEventId).toHaveBeenCalled();
      expect(repository.updateEvent).toHaveBeenCalled();
    });

    it('should calculate correct remaining tickets', async () => {
      const mockEventWithParticipants = {
        ...mockEvent,
        participantnbr: 100,
        ticketrestant: 100,
      } as Event;

      repository.findById.mockResolvedValue(mockEventWithParticipants);
      
      participantService.getParticipantsByEventId.mockResolvedValue(
        Array(5).fill({} as Participant)
      );
      
      repository.updateEvent.mockResolvedValue({
        ...mockEventWithParticipants,
        ticketrestant: 95
      } as Event);

      await service.updateTicketsCount(mockEvent._id.toString());
      
      expect(repository.updateEvent).toHaveBeenCalledWith(
        mockEvent._id.toString(),
        expect.objectContaining({ ticketrestant: 95 })
      );
    });

    it('should throw EventNotFoundException when event not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.updateTicketsCount('nonexistent-id')).rejects.toThrow(EventNotFoundException);
    });
  });
});
