import { Module , NestModule, MiddlewareConsumer} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module'
import { ErrorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import {EventsModule}from './event/event.module'
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
    EventsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
   
    consumer.apply(ErrorHandlerMiddleware).forRoutes('*');
  }
}
