import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'participants',
  timestamps: true,
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

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Event' }],
    default: [],
  })
  events: MongooseSchema.Types.ObjectId[];
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant); 