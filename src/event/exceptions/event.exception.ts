import { HttpException, HttpStatus } from '@nestjs/common';

export class EventNotFoundException extends HttpException {
  constructor(eventId: string) {
    super(`Event with ID ${eventId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class EventNameConflictException extends HttpException {
  constructor(eventName: string) {
    super(`An event with the name "${eventName}" already exists`, HttpStatus.CONFLICT);
  }
}

export class InvalidEventDateException extends HttpException {
    constructor(startDate: string, endDate: string) {
      super(
        `Invalid event dates: Start date (${startDate}) must be before end date (${endDate})`,
        HttpStatus.BAD_REQUEST
      );
    }
  }



