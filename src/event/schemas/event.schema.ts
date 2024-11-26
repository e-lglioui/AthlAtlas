import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Document, Schema as MongooseSchema } from 'mongoose';
@Schema({
    collection: 'events',
    timestamps: true,
  })
  export class Event extends Document{
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
      })
      userId: MongooseSchema.Types.ObjectId;
      @Prop({
        required: true,
      })
      name: string;

      @Prop({ required: true })
      bio: string;

    @Prop({required:true})
    participantnbr:number;

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
  export const  EventSchema =  SchemaFactory.createForClass(Event);