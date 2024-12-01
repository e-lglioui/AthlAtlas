import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { EventService } from '../providers/event.service';

@Injectable()
export class EventOwnerGuard extends JwtAuthGuard {
  constructor(
    private readonly eventService: EventService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log(user ); 
    const eventId = request.params.id;
    
    const event = await this.eventService.findById(eventId);
    
    if (!event) {
      throw new ForbiddenException('Event not found');
    }
    if (event.userId.toString() !== user.userId) {
        // console.log(user.userId);  
        // console.log(event.userId);  
        throw new ForbiddenException('You are not allowed to update this event');
      }

    const canActivate = await super.canActivate(context); 

    if (canActivate instanceof Observable) {
      return canActivate.toPromise(); 
    }

    return canActivate; 
  }
}
