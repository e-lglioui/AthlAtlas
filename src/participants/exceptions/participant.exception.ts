import { HttpException, HttpStatus } from '@nestjs/common';

export class ParticipantNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Participant with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class ParticipantAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(`Participant with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}

export class EventAlreadyJoinedException extends HttpException {
  constructor() {
    super('Participant has already joined this event', HttpStatus.CONFLICT);
  }
}

export class EventNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Event with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
