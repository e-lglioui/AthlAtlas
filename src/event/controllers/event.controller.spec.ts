import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from '../providers/event.service';
import { Event } from '../schemas/event.schema';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';

describe(' EventController',() => {
 let controller :EventController;
 let service: jest.Mocked<EventService>; 

 const mockEvent = {
    _id: 'event-id-1',
    userId:'user-id-1',
    name: 'Test Event',
    bio: 'Test Description',
    participantnbr:10,
    startDate: new Date(),
    endDate: new Date(),
   
  };
  const mockEvents = [
    {
        _id: 'event-id-1',
        userId:'user-id-1',
        name: 'Test Event',
        bio: 'Test Description',
        participantnbr:10,
        startDate: new Date(),
        endDate: new Date(),
    },
    {
        _id: 'event-id-2',
        userId:'user-id-2',
        name: 'Test Event 2',
        bio: 'Test Description 2',
        participantnbr:12,
        startDate: new Date(),
        endDate: new Date(),
    },
  ];
  const MockeEventService ={
    getAllEvent:  jest.fn().mockResolvedValue(mockEvents),
    findById: jest.fn(),
    findByName : jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    exportParticipants: jest.fn(),
     }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: MockeEventService,
        },
      ],
    }).compile();
     controller = module.get<EventController>(EventController);
    service = module.get(EventService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getAllEvents', () => {

    it('return array of event',async()=>{
       
          MockeEventService.getAllEvent.mockResolvedValue(mockEvents);
          const result = await controller.getAllEvents();
          expect(result).toBe(mockEvents);
          expect(service.getAllEvent).toHaveBeenCalled();
          expect(result.length).toBe(2);
    })
    it('should retur an empty array si ilya pas des events',async()=>{
        MockeEventService.getAllEvent.mockResolvedValue([]);
        const result = await controller.getAllEvents();
        expect(result).toEqual([]);
        expect(service.getAllEvent).toHaveBeenCalled();
        expect(result.length).toBe(0);
    })
    it('should return error',async ()=>{
        const error = new Error('Database error');
        MockeEventService.getAllEvent.mockRejectedValue(error);
        await expect(controller.getAllEvents()).rejects.toThrow(error);
        expect(MockeEventService.getAllEvent).toHaveBeenCalled();
    })
  })
})