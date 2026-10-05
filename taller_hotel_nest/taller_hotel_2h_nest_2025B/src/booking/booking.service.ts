import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between,  } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Room } from '../room/room.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(userId: number , createBookingDto :CreateBookingDto): Promise<Booking> {
    const checkInDate = new Date(createBookingDto.checkInDate);
    const checkOutDate = new Date(createBookingDto.checkOutDate);
    // TODO: Implement date conflict validation - check if room is already booked for those dates
    // TODO: Implement price calculation based on number of nights and room
    //Buscar la habitacion
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Check-out date must be after check-in date',);
    }
    const room = await this.roomRepository.findOne({
      where: { id: createBookingDto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with id ${createBookingDto.roomId} not found`,);
    }
    const conflict = await this.hasDateConflict(createBookingDto.roomId, checkInDate, checkOutDate,);
    if (conflict) {
      throw new BadRequestException('The room is already booked for these dates',);
    }
    // Calcular Cantidad de Noches
    const miliseconsPerDay = 1000 * 60 * 60 * 24;
    const numberOfNights =Math.ceil( (checkOutDate.getTime() - checkInDate.getTime()) / miliseconsPerDay,);

    const totalPrice = numberOfNights * room.pricePerNight;
    // BUG: Wrong property name - should be 'room', not 'roomId' (DONE)
    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      checkInDate,
      checkOutDate,
      totalPrice,
      room: { id: createBookingDto.roomId },
      user: { id: userId },
      status: 'pending',
    });

    return this.bookingsRepository.save(booking);
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['room', 'user'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return booking;
  }

  async findByUser(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { user: { id: userId } },
      relations: ['room', 'user'],
    });
  }

  async findByRoom(roomId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { room: { id: roomId } },
      relations: ['room', 'user'],
    });
  }

  // TODO: Implement cancel method - change status to 'cancelled' (DONE)
  async cancel(id: number): Promise<Booking> {
    const idRoom = await this.findOne(id);
    idRoom.status = 'cancelled';
    return this.bookingsRepository.save(idRoom);
  }

  // TODO: Implement method to check for date conflicts (DONE)
  async hasDateConflict(
    roomId: number,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<boolean> {
    const allBookings = await this.bookingsRepository.find({ where: { room: { id: roomId } },});
    const activeBookings = allBookings.filter((Booking) => Booking.status !== 'cancelled');
    return activeBookings.some((booking) =>  booking.checkInDate < checkOutDate && booking.checkOutDate > checkInDate,);
  }

  // TODO: Implement method to get all bookings for a date range (DONE)
  async getBookingsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Booking[]> {
    return this.bookingsRepository.find({
    where: {checkInDate: Between(startDate, endDate),},
    relations: ['room', 'user'],});
  }
}
