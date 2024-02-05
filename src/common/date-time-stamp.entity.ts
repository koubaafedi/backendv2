import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class DateTimeStampEntity {
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date = null;
}
