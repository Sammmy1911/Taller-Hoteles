import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { Hotel } from 'src/hotel/hotel.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async create(hotelId: number, createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomsRepository.create({
      ...createRoomDto,
      hotel: { id: hotelId },
    });

    return this.roomsRepository.save(room);
  }

  async findAll(hotelId: number): Promise<Room[]> {
    return this.roomsRepository.find({
      where: { hotel: { id: hotelId } },
    });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['hotel', 'bookings'],
    });

    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    return room;
  }

  async update(id: number, updateData: Partial<CreateRoomDto>): Promise<Room> {
    const result = await this.roomsRepository.update(id, updateData);
    if(result.affected && result.affected < 1){
      throw new NotFoundException(`Not Found`);
    }
    return this.findOne(id);

  }

  async delete(id: number): Promise<boolean> {
    const result = await this.roomsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    return true;
  }
  async getAvailability(hotelId: number): Promise<Room[]> {
    return this.roomsRepository.find({
      where: {
        hotel: { id: hotelId },
        available: true,
      },
    });
  }
  async isAvailableForDateRange(  roomId: number,startDate: Date,endDate: Date,): Promise<boolean>{
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['bookings'],
    });
    if (!room || !room.available) {
      return false;
    }
    if (!room.bookings || room.bookings.length === 0) {
      return true;
    }
    const hasConflict = room.bookings.some(
      (booking) =>
        booking.status !== 'cancelled' &&
        booking.checkInDate < endDate &&
        booking.checkOutDate > startDate,
    );
    return !hasConflict;
  }
}
