import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/common/crud.service';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserService } from 'src/user/user.service';
import { User, UserRoleEnum } from 'src/user/entities/user.entity';

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

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    if (user.role !== UserRoleEnum.organizer) {
      throw new ForbiddenException('Only organizers can create events !');
    }
    // const { organizerId, ...eventData } = createEventDto;

    //const organizer = await this.usersService.findOne(organizerId);
    const event = this.eventRepository.create({
      //...eventData,
      ...createEventDto,
      organizer: user,
      volunteers: [],
    });
    user.events = user.events || [];
    user.events.push(event);
    return await this.eventRepository.save(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    if (user.role !== UserRoleEnum.organizer) {
      throw new ForbiddenException('Only organizers can edit events !');
    }

    const event = await this.findOne(id);
    if (!this.usersService.isOwnerOrAdmin(event, user)) {
      throw new ForbiddenException(
        'You need to be the owner of this event or an admin to modify it !',
      );
    }
    // //if (organizerId)
    // if (user.id !== event.organizer.id) {
    //   //const organizer = await this.usersService.findOne(organizerId);
    //   event.organizer = user;
    // }
    const { name, description, date, location, picture } = updateEventDto;

    event.name = name ?? event.name;
    event.description = description ?? event.description;
    event.date = date ?? event.date;
    event.location = location ?? event.location;
    event.picture = picture ?? event.picture;

    return await this.eventRepository.save(event);
  }

  async participate(user: User, eventId: string): Promise<void> {
    //const user = await this.usersService.findOne(userId);
    if (user.role !== UserRoleEnum.volunteer) {
      throw new ForbiddenException(
        'Only volunteers can participate in events !',
      );
    }
    const event = await this.findOne(eventId);
    event.volunteers = event.volunteers || [];
    const isVolunteer = event.volunteers.some(
      (volunteer) => volunteer.id === user.id,
    );
    if (!isVolunteer) {
      event.volunteers.push(user);

      await this.usersService.addEventToAttendedEvents(user, event);

      await this.eventRepository.save(event);
    }
  }
  async remove(id: string, user: User): Promise<void> {
    if (user.role !== UserRoleEnum.organizer) {
      throw new ForbiddenException('Only organizers can delete events !');
    }

    const event = await this.findOne(id);
    if (!this.usersService.isOwnerOrAdmin(event, user)) {
      throw new ForbiddenException(
        'You need to be the owner of this event or an admin to delete it !',
      );
    }
    await this.eventRepository.softRemove(event);
  }
}
