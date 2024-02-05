import { DateTimeStampEntity } from 'src/common/date-time-stamp.entity';
import { Event } from 'src/event/entities/event.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRoleEnum {
  admin = 'admin',
  volunteer = 'volunteer',
  organizer = 'organizer',
}

@Entity()
export class User extends DateTimeStampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column()
  bio: string;

  @Column()
  profilePicture: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.volunteer,
  })
  role: UserRoleEnum;

  @ManyToMany(() => Event, (event) => event.volunteers)
  attendedEvents: Event[];

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];
}
