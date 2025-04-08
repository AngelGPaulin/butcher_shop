import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  create(createLocationDto: CreateLocationDto) {
    const location = this.locationRepository.create(createLocationDto);
    return this.locationRepository.save(location);
  }

  findAll() {
    return this.locationRepository.find({
      relations: ['empleados'],
    });
  }

  async findOne(id: string) {
    const location = await this.locationRepository.findOne({
      where: { locationId: id },
      relations: ['empleados'],
    });

    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const location = await this.locationRepository.preload({
      locationId: id,
      ...updateLocationDto,
    });

    if (!location) throw new NotFoundException('Location not found');

    return this.locationRepository.save(location);
  }

  async remove(id: string) {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);

    return {
      message: `Location with ID ${id} deleted`,
    };
  }
}
