import { Module , NestModule, MiddlewareConsumer} from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module'
import { ErrorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import {EventModule}from './event/event.module'
import {ParticipantModule} from './participants/participant.module'
import { ExportModule } from './participants/export.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EventModule,
    ParticipantModule,
    ExportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
   
    consumer.apply(ErrorHandlerMiddleware).forRoutes('*');
  }
}
