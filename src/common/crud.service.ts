import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HasIdInterface } from './has-id.interface';

@Injectable()
export class CrudService<T extends HasIdInterface> {
  constructor(private repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
