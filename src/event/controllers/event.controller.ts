import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    UseGuards,
    Res,
    HttpStatus
  } from '@nestjs/common';
  import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
  import { EventService } from '../providers/event.service';
  import { CreateEventDto } from '../dtos/create-event.dto';
  import { UpdateEventDto } from '../dtos/update-event.dto';
  import { Event } from '../schemas/event.schema';
  import {JwtAuthGuard}from '../../auth/guards/jwt-auth.guard';
  import {EventOwnerGuard}from '../guards/eventowner.guard';
  import { Response } from 'express';
  import * as fs from 'fs';
  import { Participant } from '../../participants/schemas/participant.schema';
  import { ExportFormat } from '../../common/enums/export-format.enum';
  import { EventStatsDto } from '../dtos/event-stats.dto';

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
  
    @Get(':id/participants/export')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Export participants list' })
    @ApiParam({ name: 'id', description: 'Event ID' })
    @ApiQuery({ 
      name: 'format', 
      enum: ['pdf', 'csv', 'excel'], 
      description: 'Export format (pdf, csv, excel)',
      required: false,
      default: 'pdf'
    })
    async exportParticipants(
      @Param('id') id: string,
      @Query('format') format: string = 'pdf',
      @Res() res: Response,
    ) {
      try {
       
        let exportFormat: ExportFormat;
        switch (format) {
          case 'pdf':
            exportFormat = ExportFormat.PDF;
            break;
          case 'csv':
            exportFormat = ExportFormat.CSV;
            break;
          case 'excel':
            exportFormat = ExportFormat.EXCEL;
            break;
          default:
            exportFormat = ExportFormat.PDF;
        }

        const filePath = await this.eventService.exportParticipants(id, exportFormat);

        const mimeTypes = {
          'pdf': 'application/pdf',
          'csv': 'text/csv',
          'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        // Configuration des headers pour FileSaver.js
        res.setHeader('Content-Type', mimeTypes[format]);
        res.setHeader(
          'Content-Disposition', 
          `attachment; filename=event-${id}-participants.${format === 'excel' ? 'xlsx' : format}`
        );
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        // Envoyer le fichier
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Nettoyer le fichier après l'envoi
        fileStream.on('end', () => {
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        });

        // Gérer les erreurs de stream
        fileStream.on('error', (error) => {
          console.error('File stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error reading export file' });
          }
        });

      } catch (error) {
        console.error('Export error:', error);
        if (!res.headersSent) {
          res.status(error.status || 500).json({
            message: error.message || 'Failed to export participants'
          });
        }
      }
    }
  
    @Get(':id/participants')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all participants for an event' })
    @ApiParam({ name: 'id', description: 'Event ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Return all participants for the specified event.',
      type: [Participant]
    })
    @ApiResponse({ 
      status: 404, 
      description: 'Event not found.'
    })
    async getEventParticipants(
      @Param('id') id: string
    ): Promise<Participant[]> {
      return this.eventService.getEventParticipants(id);
    }
  
    @Get('stats/overview')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get event statistics overview' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Event statistics overview',
      type: EventStatsDto
    })
    async getEventStatistics(): Promise<EventStatsDto> {
      return this.eventService.getEventStatistics();
    }
  
    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get events by user ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Return all events for the specified user',
      type: [Event] 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'User not found or has no events' 
    })
    async getEventsByUserId(
      @Param('userId') userId: string
    ): Promise<Event[]> {
      return this.eventService.getEventsByUserId(userId);
    }
  }
  