import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CrudService } from 'src/common/crud.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRoleEnum } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Event } from 'src/event/entities/event.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    super(userRepository);
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with id=${id} was not found`);
    }
    return user;
  }
  async signIn(email: string, password: string) {
    const user = await this.findByUserNameOrEmail(email);
    if (!user)
      throw new UnauthorizedException('Veuillez vérifier vos credentials !');

    const isLoggedIn = await bcrypt.compare(password, user.password);
    if (isLoggedIn) {
      const { password, ...payload } = user;

      return { access_token: this.jwtService.sign(payload) };
    }
    throw new UnauthorizedException('Veuillez vérifier vos credentials !');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    user.attendedEvents = [];
    user.events = [];
    try {
      return await this.userRepository.save(user);
    } catch (e) {
      throw new ConflictException(
        'Le username et le email doivent être unique',
      );
    }
  }

  findByUserNameOrEmail(identifier: string): Promise<User> {
    return this.userRepository.findOne({
      where: [{ name: identifier }, { email: identifier }],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    user: User,
  ): Promise<User> {
    const userToUpdate = await this.findOne(id);
    if (!this.isSameOrAdmin(userToUpdate, user)) {
      throw new ForbiddenException(
        'You need to be the same user or an admin to modify it this user !',
      );
    }
    const { name, email, password, bio, profilePicture } = updateUserDto;

    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.password = password || userToUpdate.password;
    userToUpdate.bio = bio || userToUpdate.bio;
    userToUpdate.profilePicture = profilePicture || userToUpdate.profilePicture;

    return await this.userRepository.save(userToUpdate);
  }

  async addEventToAttendedEvents(user: User, event: Event): Promise<void> {
    user.attendedEvents = user.attendedEvents || [];
    user.attendedEvents.push(event);
    await this.userRepository.save(user);
  }

  async remove(id: string, user: User): Promise<void> {
    const userToDelete = await this.findOne(id);
    if (!this.isSameOrAdmin(userToDelete, user)) {
      throw new ForbiddenException(
        'You need to be the same user or an admin to delete it this user !',
      );
    }
    await this.userRepository.softRemove(userToDelete);
  }
  isOwnerOrAdmin(event: Event, user: User): boolean {
    return (
      user.role === UserRoleEnum.admin ||
      (event.organizer && event.organizer.id === user.id)
    );
  }
  isSameOrAdmin(userToChange: User, user: User): boolean {
    return user.role === UserRoleEnum.admin || userToChange.id === user.id;
  }
}
