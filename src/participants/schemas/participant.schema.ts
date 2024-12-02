import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'participants',
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Participant extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;
  
  @Prop()
  organization: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }] })
  events: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

ParticipantSchema.pre('save', function(next) {
  // Validation personnalisée si nécessaire
  next();
}); 