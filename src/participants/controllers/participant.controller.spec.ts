import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from '../providers/sparticipant.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParticipantNotFoundException } from '../exceptions/participant.exception';

describe('ParticipantController', () => {
  let controller: ParticipantController;
  let service: jest.Mocked<ParticipantService>;

  const mockParticipant = {
    _id: new Types.ObjectId('64d1f83bfc13ae1c4b000001'),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    organization: 'Test Org',
    age: 25,
    gender: 'male',
    events: [new Types.ObjectId('64d1f83bfc13ae1c4b000002')],
  };

  const mockCreateParticipantDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    organization: 'Test Org',
    age: 25,
    gender: 'male',
    eventId: '64d1f83bfc13ae1c4b000002'
  };

  const mockUpdateParticipantDto = {
    firstName: 'John Updated',
    lastName: 'Doe Updated',
    phone: '0987654321',
  };

  const MockParticipantService = {
    createParticipant: jest.fn(),
    getAllParticipants: jest.fn(),
    getParticipantById: jest.fn(),
    getParticipantsByEventId: jest.fn(),
    updateParticipant: jest.fn(),
    deleteParticipant: jest.fn(),
    addEventToParticipant: jest.fn(),
    removeEventFromParticipant: jest.fn(),
    checkEmailExists: jest.fn(),
    searchByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: MockParticipantService,
        },
      ],
    }).compile();

    controller = module.get<ParticipantController>(ParticipantController);
    service = module.get(ParticipantService);
  });

  describe('createParticipant', () => {
    it('should create a participant successfully', async () => {
      MockParticipantService.createParticipant.mockResolvedValue(mockParticipant);

      const result = await controller.createParticipant(mockCreateParticipantDto);

      expect(result).toEqual(mockParticipant);
      expect(service.createParticipant).toHaveBeenCalledWith(mockCreateParticipantDto);
    });

    it('should handle creation errors', async () => {
      MockParticipantService.createParticipant.mockRejectedValue(new BadRequestException());

      await expect(controller.createParticipant(mockCreateParticipantDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllParticipants', () => {
    it('should return all participants', async () => {
      MockParticipantService.getAllParticipants.mockResolvedValue([mockParticipant]);

      const result = await controller.getAllParticipants();

      expect(result).toEqual([mockParticipant]);
      expect(service.getAllParticipants).toHaveBeenCalled();
    });
  });

  describe('getParticipantById', () => {
    it('should return a participant by ID', async () => {
      MockParticipantService.getParticipantById.mockResolvedValue(mockParticipant);

      const result = await controller.getParticipantById(mockParticipant._id.toString());

      expect(result).toEqual(mockParticipant);
      expect(service.getParticipantById).toHaveBeenCalledWith(mockParticipant._id.toString());
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(controller.getParticipantById('nonexistent-id'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ParticipantNotFoundException when participant not found with valid ID', async () => {
      const validId = new Types.ObjectId().toString();
      MockParticipantService.getParticipantById.mockRejectedValue(new ParticipantNotFoundException(validId));
      
      await expect(controller.getParticipantById(validId))
        .rejects.toThrow(ParticipantNotFoundException);
    });
  });

  describe('getParticipantsByEventId', () => {
    it('should return participants for an event', async () => {
      MockParticipantService.getParticipantsByEventId.mockResolvedValue([mockParticipant]);

      const result = await controller.getParticipantsByEventId('event-id');

      expect(result).toEqual([mockParticipant]);
      expect(service.getParticipantsByEventId).toHaveBeenCalledWith('event-id');
    });
  });

  describe('updateParticipant', () => {
    it('should update a participant successfully', async () => {
      const updatedParticipant = { ...mockParticipant, ...mockUpdateParticipantDto };
      MockParticipantService.updateParticipant.mockResolvedValue(updatedParticipant);

      const result = await controller.updateParticipant(
        mockParticipant._id.toString(),
        mockUpdateParticipantDto
      );

      expect(result).toEqual(updatedParticipant);
      expect(service.updateParticipant).toHaveBeenCalledWith(
        mockParticipant._id.toString(),
        mockUpdateParticipantDto
      );
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(
        controller.updateParticipant('nonexistent-id', mockUpdateParticipantDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ParticipantNotFoundException when participant not found with valid ID', async () => {
      const validId = new Types.ObjectId().toString();
      MockParticipantService.updateParticipant.mockRejectedValue(new ParticipantNotFoundException(validId));
      
      await expect(
        controller.updateParticipant(validId, mockUpdateParticipantDto)
      ).rejects.toThrow(ParticipantNotFoundException);
    });
  });

  describe('deleteParticipant', () => {
    it('should delete a participant successfully', async () => {
      MockParticipantService.deleteParticipant.mockResolvedValue(mockParticipant);

      const result = await controller.deleteParticipant(mockParticipant._id.toString());

      expect(result).toEqual(mockParticipant);
      expect(service.deleteParticipant).toHaveBeenCalledWith(mockParticipant._id.toString());
    });

    it('should throw NotFoundException when participant not found', async () => {
      MockParticipantService.deleteParticipant.mockRejectedValue(
        new ParticipantNotFoundException('nonexistent-id')
      );

      await expect(controller.deleteParticipant('nonexistent-id'))
        .rejects.toThrow(ParticipantNotFoundException);
    });
  });

  describe('addEventToParticipant', () => {
    it('should add event to participant successfully', async () => {
      const updatedParticipant = {
        ...mockParticipant,
        events: [...mockParticipant.events, new Types.ObjectId()]
      };
      MockParticipantService.addEventToParticipant.mockResolvedValue(updatedParticipant);

      const result = await controller.addEventToParticipant(
        mockParticipant._id.toString(),
        'new-event-id'
      );

      expect(result).toEqual(updatedParticipant);
      expect(service.addEventToParticipant).toHaveBeenCalledWith(
        mockParticipant._id.toString(),
        'new-event-id'
      );
    });
  });

  describe('removeEventFromParticipant', () => {
    it('should remove event from participant successfully', async () => {
      const updatedParticipant = { ...mockParticipant, events: [] };
      MockParticipantService.removeEventFromParticipant.mockResolvedValue(updatedParticipant);

      const result = await controller.removeEventFromParticipant(
        mockParticipant._id.toString(),
        mockParticipant.events[0].toString()
      );

      expect(result).toEqual(updatedParticipant);
      expect(service.removeEventFromParticipant).toHaveBeenCalledWith(
        mockParticipant._id.toString(),
        mockParticipant.events[0].toString()
      );
    });
  });

  describe('checkEmailExists', () => {
    it('should check if email exists', async () => {
      MockParticipantService.checkEmailExists.mockResolvedValue(true);

      const result = await controller.checkEmailExists('john@example.com');

      expect(result).toBe(true);
      expect(service.checkEmailExists).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('searchParticipantsByName', () => {
    it('should search participants by name', async () => {
      MockParticipantService.searchByName.mockResolvedValue([mockParticipant]);

      const result = await controller.searchParticipantsByName('John');

      expect(result).toEqual([mockParticipant]);
      expect(service.searchByName).toHaveBeenCalledWith('John');
    });

    it('should throw BadRequestException when search query is empty', async () => {
      await expect(controller.searchParticipantsByName('')).rejects.toThrow(BadRequestException);
    });
  });
}); 