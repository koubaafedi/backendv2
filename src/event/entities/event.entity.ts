import { DateTimeStampEntity } from 'src/common/date-time-stamp.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Event extends DateTimeStampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column()
  picture: string;

  @ManyToOne(() => User, (organizer) => organizer.events, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  organizer: User;

  @ManyToMany(() => User, (volunteer) => volunteer.attendedEvents, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  volunteers: User[];
}
