import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/common/crud.service';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EventService extends CrudService<Event> {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private readonly usersService: UserService,
  ) {
    super(eventRepository);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id: id });
    if (!event) {
      throw new NotFoundException(`Event with id=${id} was not found`);
    }
    return event;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { organizerId, ...eventData } = createEventDto;

    const organizer = await this.usersService.findOne(organizerId);

    const event = this.eventRepository.create({
      ...eventData,
      organizer: organizer,
      volunteers: [],
    });

    return await this.eventRepository.save(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    const { name, description, date, location, picture, organizerId } =
      updateEventDto;

    if (organizerId) {
      const organizer = await this.usersService.findOne(organizerId);

      event.organizer = organizer;
    }

    event.name = name ?? event.name;
    event.description = description ?? event.description;
    event.date = date ?? event.date;
    event.location = location ?? event.location;
    event.picture = picture ?? event.picture;

    return await this.eventRepository.save(event);
  }

  async participate(userId: string, eventId: string): Promise<void> {
    const user = await this.usersService.findOne(userId);
    const event = await this.findOne(eventId);

    const isVolunteer = event.volunteers.some(
      (volunteer) => volunteer.id === user.id,
    );
    if (!isVolunteer) {
      event.volunteers.push(user);

      await this.usersService.addEventToAttendedEvents(user, event);

      await this.eventRepository.save(event);
    }
  }
}
