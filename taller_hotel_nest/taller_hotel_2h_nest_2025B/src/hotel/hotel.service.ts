import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelsRepository.create(createHotelDto);
    return this.hotelsRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return this.hotelsRepository.find({ relations: ['rooms'] });
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with id ${id} not found`);
    }

    return hotel;
  }

  async update(id: number, updateData: Partial<CreateHotelDto>): Promise<Hotel> {
    const result = await this.hotelsRepository.update(id, updateData);
    if (!result.affected) {
      throw new NotFoundException(`Hotel with id ${id} not found`);
    }
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const hotel = await this.hotelsRepository.delete(id);
    if (!hotel.affected) {
      throw new NotFoundException(`Hotel with id ${id} not found`);
    }
    return true;
  }

  async searchByLocation(location: string): Promise<Hotel[]> {
    return this.hotelsRepository.find({
      where: { location },
      relations: ['rooms'],
    });
  }

  async getAvailableHotels(): Promise<Hotel[]> {
    return this.hotelsRepository.find({
      relations: ['rooms'],
    });
  }
}
