// TODO: Add validation decorators (IsDateString, IsNumber, validate checkOutDate > checkInDate)
import { IsDateString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  roomId: number;
  @IsDateString()
  checkInDate: Date;
  @IsDateString()
  checkOutDate: Date;
}
