import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserDecorator } from 'src/common/user.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('participate/:id')
  async participate(
    @Param('id')
    eventId: string,
    //@Param('userId') userId: string,
    @UserDecorator() user,
  ): Promise<void> {
    await this.eventService.participate(user, eventId);
  }

  @Post()
  create(@Body() createEventDto: CreateEventDto, @UserDecorator() user) {
    return this.eventService.create(createEventDto, user);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UserDecorator() user,
  ) {
    return this.eventService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDecorator() user) {
    return this.eventService.remove(id, user);
  }
}
