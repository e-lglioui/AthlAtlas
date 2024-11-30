export class EventStatsDto {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  totalParticipants: number;
  averageParticipantsPerEvent: number;
  ticketUtilization: {
    totalTickets: number;
    soldTickets: number;
    utilizationRate: number;
  };
  eventsByMonth: Record<string, number>;
  participationTrends: {
    eventId: string;
    eventName: string;
    totalTickets: number;
    soldTickets: number;
    remainingTickets: number;
  }[];
} 