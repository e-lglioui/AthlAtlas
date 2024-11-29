import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'events',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Event extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ 
    type: Number,
    required: true,
    min: 0
  })
  participantnbr: number;

  @Prop({
    type: Number,
    default: function() {
      return this.participantnbr;
    },
    min: 0
  })
  ticketrestant: number;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.pre('save', function(next) {
  if (this.ticketrestant < 0) {
    next(new Error('No more tickets available'));
  }
  next();
});

EventSchema.methods.updateTicketsCount = async function(participantCount: number) {
  this.ticketrestant = this.participantnbr - participantCount;
  return this.save();
};