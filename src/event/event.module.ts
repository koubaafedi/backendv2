import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [TypeOrmModule.forFeature([Event]), UserModule],
})
export class EventModule {}
