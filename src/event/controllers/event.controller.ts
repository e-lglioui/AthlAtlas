import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    NotFoundException ,
    UseGuards
  } from '@nestjs/common';
  import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { EventService } from '../providers/event.service';
  import { CreateEventDto } from '../dtos/create-event.dto';
  import { UpdateEventDto } from '../dtos/update-event.dto';
  import { Event } from '../schemas/event.schema';
  import {JwtAuthGuard}from '../../auth/guards/jwt-auth.guard';
  import {EventOwnerGuard}from '../guards/eventowner.guard';


  @ApiTags('events')
  @Controller('events')
  export class EventController {
    constructor(private readonly eventService: EventService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard) 
    @ApiOperation({ summary: 'Get all events' })
    @ApiResponse({ status: 200, description: 'Return all events.', type: [Event] })
    async getAllEvents(): Promise<Event[]> {
      return this.eventService.getAllEvent();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    @ApiResponse({
      status: 200,
      description: 'Return the event with the specified ID.',
      type: Event,
    })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    async getEventById(@Param('id') id: string): Promise<Event> {
      return this.eventService.findById(id);
    }
  
    @Get('ev/search')
    @ApiOperation({ summary: 'Search event by name' })
    @ApiResponse({
      status: 200,
      description: 'Return the event matching the specified name.',
      type: Event,
    })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    async findEventByName(@Query('name') name: string): Promise<Event> {
      return this.eventService.findByName(name);
    }
  
    @Post()
    @ApiOperation({ summary: 'Create an event' })
    @ApiResponse({
      status: 201,
      description: 'The event has been successfully created.',
      type: Event,
    })
    async createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
      return this.eventService.createEvent(createEventDto);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard, EventOwnerGuard)
    @ApiOperation({ summary: 'Update an event' })
    @ApiResponse({
      status: 200,
      description: 'The event has been successfully updated.',
      type: Event,
    })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    async updateEvent(
      @Param('id') id: string, 
      @Body() updateEventDto: UpdateEventDto
    ): Promise<Event> {
      return this.eventService.updateEvent(id, updateEventDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, EventOwnerGuard)
    @ApiOperation({ summary: 'Delete an event' })
    @ApiResponse({
      status: 200,
      description: 'The event has been successfully deleted.',
      type: Event,
    })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    async deleteEvent(@Param('id') id: string): Promise<Event> {
      return this.eventService.deleteEvent(id);
    }
  }
  